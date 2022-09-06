import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AccountId, AccountIdParams } from 'caip'
import { ObjectId } from 'mongodb'
import { MongoRepository } from 'typeorm'
import { v4 as uuidV4 } from 'uuid'

import { Pagination } from '@common/decorators/pagination.decorators'
import { CreateUserDto } from '@common/dto/create-user.dto'
import { UserDto } from '@common/dto/entities/user.dto'
import { UpdateUserDto } from '@common/dto/update-user.dto'
import { recoveryAgent } from '@common/utils'

import type { AccountIdDto } from '@common/types/caip'

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserDto) private readonly userRepo: MongoRepository<UserDto>) {}

  async create(createUserDto: CreateUserDto) {
    const userData = {
      ...createUserDto,
      uuid: uuidV4(),
      accountIds: createUserDto.accountIds.map(
        (accountId: string | AccountIdParams) => new AccountId(accountId).toJSON() as AccountIdDto
      )
    }
    const user = this.userRepo.create(userData)
    await this.userRepo.save(user)
    return user
  }

  async findAll({ query, ...match }: Pagination & Partial<UserDto>) {
    const [users] = await this.userRepo
      .aggregate<UserDto[]>([
        {
          $match: match
        },
        {
          $addFields: {
            id: '$_id'
          }
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: query
          }
        },
        {
          $project: {
            data: 1,
            total: { $arrayElemAt: ['$metadata.total', 0] }
          }
        }
      ])
      .toArray()

    return users
  }

  async findByEmail(email: string) {
    const [user] = await this.userRepo
      .aggregate<UserDto>([
        {
          $match: {
            email
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()

    if (!user) throw new NotFoundException(`UserDto with email ${email} not found`)

    return user
  }

  async findById(id: string) {
    const [user] = await this.userRepo
      .aggregate<UserDto>([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()

    if (!user) throw new NotFoundException(`UserDto with id ${id} not found`)

    return user
  }

  async findByUUID(uuid: string): Promise<UserDto> {
    const [user] = await this.userRepo
      .aggregate<UserDto>([
        {
          $match: {
            uuid
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()
    return user
  }

  async findByAccountId(accountId: AccountId) {
    const [user] = await this.userRepo
      .aggregate<UserDto>([
        {
          $match: {
            accountIds: {
              $elemMatch: accountId.toJSON()
            }
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()
    return user
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    const user = await this.findById(id)

    if (updatedUser.roles === null) {
      updatedUser.roles = user.roles
    }

    Object.assign(user, updatedUser)
    return await this.userRepo.save(user)
  }

  async remove(id: string) {
    const user = await this.findById(id)
    return this.userRepo.softRemove(user)
  }

  async recover(id?: string) {
    return await recoveryAgent(this.userRepo, id)
  }
}
