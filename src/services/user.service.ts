import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AccountId, AccountIdParams } from 'caip'
import { DeleteResult, UpdateResult } from 'mongodb'
import { v4 as uuidV4 } from 'uuid'

import { Pagination } from '@common/decorators/pagination.decorators'
import { CreateUserDto } from '@common/dto/create-user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { UserDto, UserDocument } from '@common/schemas/user.schema'

import type { AccountIdDto } from '@common/types/caip'
import type { SoftDeleteModel } from 'mongoose-delete'

@Injectable()
export class UserService {
  constructor(@InjectModel(UserDto.name) private userModel: SoftDeleteModel<UserDocument>) {}

  async create(createUserDto: CreateUserDto) {
    const userData = {
      ...createUserDto,
      uuid: uuidV4(),
      accountIds: createUserDto.accountIds.map(
        (accountId: string | AccountIdParams) => new AccountId(accountId).toJSON() as AccountIdDto
      )
    }
    const user = new this.userModel(userData)
    await user.save()
    return user
  }

  async findAll({ skip, limit, sort, ...match }: Pagination & Partial<UserDto>) {
    const data = await this.userModel.find(match).sort(sort).skip(skip).limit(limit).exec()
    const total = await this.userModel.find(match).count()
    return { data, total }
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email }).exec()
    return user
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).exec()
    return user
  }

  async findByUUID(uuid: string): Promise<UserDto> {
    const user = await this.userModel.findOne({ uuid }).exec()
    return user
  }

  async findByAccountId(accountId: AccountId) {
    const [user] = await this.userModel.find().elemMatch('accountIds', accountId.toJSON()).exec()
    return user
  }

  async update(id: string, update: UpdateUserDto) {
    const user = await this.userModel.findByIdAndUpdate(id, update, { new: true }).exec()
    return user
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.userModel.deleteById(id).exec()
  }

  async recover(id?: string): Promise<UpdateResult> {
    return await this.userModel.restore({ _id: id }).exec()
  }
}
