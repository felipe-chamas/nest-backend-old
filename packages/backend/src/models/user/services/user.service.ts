import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { AccountId, AccountIdParams } from 'caip';
import { AccountIdDto } from 'common/types';
import { Pagination } from 'common/decorators';
import { User } from 'common/entities';
import { recoveryAgent } from 'common/utils';

import { MongoRepository } from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';

import { UpdateUserDto } from '../dto/update-user.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: MongoRepository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userData = {
      ...createUserDto,
      accountIds: createUserDto.accountIds.map(
        (accountId: string | AccountIdParams) =>
          new AccountId(accountId).toJSON() as AccountIdDto,
      ),
    };
    const user = this.userRepo.create(userData);
    await this.userRepo.save(user);
    return user;
  }

  async findAll({ query, ...match }: Pagination & Partial<User>) {
    const [users] = await this.userRepo
      .aggregate<User[]>([
        {
          $match: match,
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: query,
          },
        },
        {
          $project: {
            data: 1,
            total: { $arrayElemAt: ['$metadata.total', 0] },
          },
        },
      ])
      .toArray();

    return users;
  }

  async findByEmail(email: string) {
    const [user] = await this.userRepo
      .aggregate<User>([
        {
          $match: {
            email,
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!user)
      throw new NotFoundException(`User with email ${email} not found`);

    return user;
  }

  async findById(id: string) {
    const [user] = await this.userRepo
      .aggregate<User>([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async findByAccountId(accountId: AccountId) {
    const [user] = await this.userRepo
      .aggregate<User>([
        {
          $match: {
            accountIds: {
              $elemMatch: accountId.toJSON(),
            },
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();
    return user;
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    const user = await this.findById(id);

    if (updatedUser.roles === null) {
      updatedUser.roles = user.roles;
    }

    Object.assign(user, updatedUser);
    return await this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.findById(id);
    return this.userRepo.softRemove(user);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.userRepo, id);
  }
}
