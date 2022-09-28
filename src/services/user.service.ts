import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AccountId } from 'caip'
import { DeleteResult, UpdateResult } from 'mongodb'
import { v4 as uuidV4 } from 'uuid'

import { Pagination } from '@common/decorators/pagination.decorators'
import { UserDto, UserDocument } from '@common/schemas/user.schema'
import { AccountIdDto } from '@common/types/caip'

import type { SoftDeleteModel } from 'mongoose-delete'

@Injectable()
export class UserService {
  constructor(@InjectModel(UserDto.name) private userModel: SoftDeleteModel<UserDocument>) {}

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

  async findBySteamId(steamId: string) {
    const userData = { 'socialAccounts.steam.id': steamId }
    const user = await this.userModel.findOne(userData).exec()
    return user
  }

  async findOrCreateBySteamId(steamId: string) {
    const userData = { 'socialAccounts.steam.id': steamId }
    const user = await this.userModel.findOne(userData).exec()
    return user ?? this.create({ socialAccounts: { steam: { id: steamId } } })
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
