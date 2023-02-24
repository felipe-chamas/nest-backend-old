import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { AccountId } from 'caip'
import { DeleteResult, UpdateResult } from 'mongodb'
import { v4 as uuidV4 } from 'uuid'

import { Pagination } from '@common/decorators/pagination.decorators'
import { logger } from '@common/providers/logger'
import { UserDto, UserDocument } from '@common/schemas/user.schema'
import { AccountIdDto } from '@common/types/caip'
import { SteamResponseGetPlayerSummaries } from '@common/types/steam'

import { HttpElixirApiService } from './utils/elixir/api.service'
import { elixirChainMap } from './utils/elixir/constants'
import { HttpSteamApiService } from './utils/steam/api.service'

import type { ElixirUserInfo } from '@common/types/elixir'
import type { SoftDeleteModel } from 'mongoose-delete'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserDto.name) private userModel: SoftDeleteModel<UserDocument>,
    private readonly config: ConfigService,
    private readonly steamService: HttpSteamApiService,
    private readonly elixirService: HttpElixirApiService
  ) {
    this.steamService.axiosRef.defaults.params = this.steamService.axiosRef.defaults.params || {}
    this.steamService.axiosRef.defaults.params['key'] = config.get<string>('steam.apiKey')

    this.elixirService.axiosRef.defaults.params = this.elixirService.axiosRef.defaults.params || {}
    this.elixirService.axiosRef.defaults.headers.common['x-api-key'] =
      config.get<string>('elixir.apiKey')
  }

  async create(createUserDto: Partial<UserDto>) {
    const uuid = uuidV4()
    const userData = {
      ...createUserDto,
      uuid
    }
    const user = await this.userModel.create(userData)
    await user.save()
    return user
  }

  async findAll({ skip, limit, sort, ...match }: Pagination & Partial<UserDto>) {
    const data = await this.userModel.find(match).sort(sort).skip(skip).limit(limit).exec()
    const total = await this.userModel.find(match).count()
    return { data, total }
  }

  async findByUUID(uuid: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ uuid }).exec()
    return user
  }

  async findByWallet(address: string, chain: string): Promise<UserDto> {
    const user = await this.userModel
      .findOne({ 'wallet.address': address, 'wallet.secretType': chain })
      .exec()

    return user
  }

  async findByElixirId(elixirId: string) {
    const user = await this.userModel.findOne({ 'socialAccounts.elixir.id': elixirId }).exec()

    return user
  }

  async findOrCreateElixirUser(jwt: string) {
    const { data: userInfo, status: userInfoStatus } =
      await this.elixirService.axiosRef.get<ElixirUserInfo>('/sdk/v2/userinfo', {
        headers: { authorization: `Bearer ${jwt}` }
      })

    if (userInfoStatus !== 200) {
      logger.error(
        `Could not get user data from valid rei key, this might suggest an error with Elixir itself | data: ${userInfo} status: ${userInfoStatus}`
      )
      throw new BadRequestException(
        "Could not get user data from valid rei key, this shouldn't happen, so contact Elixir"
      )
    }

    const elixirId = userInfo.data.sub
    const userWithFoundElixirId = await this.findByElixirId(elixirId)

    if (userWithFoundElixirId) {
      return userWithFoundElixirId
    }

    const { wallets } = userInfo.data

    const user = (
      await Promise.all(
        wallets.map(async (wallet) => {
          const [chain, address] = wallet.split(':')

          if (chain in elixirChainMap) {
            return await this.findByWallet(address, elixirChainMap[chain])
          }
        })
      )
    ).find((user) => !!user)

    if (user) {
      await this.update(user.uuid, {
        socialAccounts: { elixir: { id: elixirId, username: userInfo.data.nickname } }
      })
      return user
    }

    return await this.create({
      name: userInfo.data.nickname,
      imageUrl: userInfo.data.picture,
      socialAccounts: { elixir: { id: elixirId, username: userInfo.data.nickname } }
    })
  }

  async findBySteamId(steamId: string) {
    const userData = { 'socialAccounts.steam.id': steamId }
    const user = await this.userModel.findOne(userData).exec()
    return user
  }

  async findOrCreateBySteamId(steamId: string) {
    const userData = { 'socialAccounts.steam.id': steamId }
    const user = await this.userModel.findOne(userData).exec()
    if (user && user.imageUrl && user.socialAccounts.steam?.username) return user

    const { data, status } = await this.steamService.axiosRef.get<SteamResponseGetPlayerSummaries>(
      `/ISteamUser/GetPlayerSummaries/v2/`,
      {
        params: {
          steamids: steamId
        }
      }
    )
    logger.info(data)
    if (status !== 200 || data.response.players.length === 0) throw new BadRequestException()

    const [player] = data.response.players

    if (user)
      return this.update(user.uuid, {
        imageUrl: player.avatarfull,
        socialAccounts: {
          ...user.socialAccounts,
          steam: {
            ...user.socialAccounts.steam,
            id: steamId,
            username: player.personaname
          }
        }
      })

    return this.create({
      name: player.realname ?? player.personaname,
      imageUrl: player.avatarfull,
      socialAccounts: { steam: { id: steamId, username: player.personaname } }
    })
  }

  async findOrCreateByAccountId(accountId: AccountId) {
    const [user] = await this.userModel.find().elemMatch('accountIds', accountId.toJSON()).exec()
    return user ?? this.create({ accountIds: [accountId.toJSON() as AccountIdDto] })
  }

  async update(uuid: string, update: Partial<UserDto>) {
    const user = await this.userModel.findOneAndUpdate({ uuid }, update, { new: true }).exec()
    return user
  }

  async remove(uuid: string): Promise<DeleteResult> {
    return await this.userModel.deleteOne({ uuid }).exec()
  }

  async recover(uuid: string): Promise<UpdateResult> {
    return await this.userModel.restore({ uuid }).exec()
  }
}
