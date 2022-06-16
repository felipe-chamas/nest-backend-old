import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { AccountId, AccountIdParams } from 'caip';
import { AccountIdDto } from 'common/types';
import { Pagination } from 'common/decorators';
import { Nft, User } from 'common/entities';
import { recoveryAgent } from 'common/utils';

import {
  FindConditions,
  FindManyOptions,
  getMongoRepository,
  ObjectID,
  Repository,
} from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';

import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
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

  async findAll(options?: FindManyOptions<User> | Pagination) {
    return await this.userRepo.find(options);
  }

  async findByEmail(email: string) {
    return await this.userRepo.find({ email });
  }

  async findById(id: ObjectID) {
    const user = await this.userRepo.findOne(id);

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return user;
  }

  async findByAccountId(accountId: AccountId): Promise<User | undefined> {
    const user = await this.userRepo.findOne({
      where: {
        accountIds: { $elemMatch: accountId.toJSON() },
      },
    });
    return user;
  }

  async findOne(conditions: FindConditions<User>) {
    let user: User;
    if (conditions?.id)
      user = await this.userRepo.findOne(String(conditions.id));
    else user = await this.userRepo.findOne(conditions);

    if (!user) throw new NotFoundException(`user not found`);

    const nfts = await getMongoRepository(Nft).find({
      userId: user.id,
    });

    const res = {
      ...user,
      nfts: nfts.map((nft) => ({
        ...nft,
        id: nft.id.toHexString(),
      })),
    };

    return res;
  }

  async update(id: ObjectID, updatedUser: UpdateUserDto) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    if (updatedUser.roles === null) {
      updatedUser.roles = user.roles;
    }

    Object.assign(user, updatedUser);
    return await this.userRepo.save(user);
  }

  async remove(id: ObjectID) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.userRepo.softRemove(user);
  }

  async recover(id?: ObjectID) {
    return await recoveryAgent(this.userRepo, id);
  }
}
