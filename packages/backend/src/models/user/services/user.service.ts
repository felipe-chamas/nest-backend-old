import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Nft, User } from 'common/entities';

import {
  FindConditions,
  getMongoRepository,
  ObjectID,
  Repository,
} from 'typeorm';

import { CreateUserDto } from '../dto/create-user.dto';

import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    return user;
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async findByEmail(email: string) {
    return await this.userRepo.find({ email });
  }

  async whoAmI(id: string) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async find(idOrConditions: string | FindConditions<User>) {
    switch (idOrConditions) {
      case typeof idOrConditions === 'string': {
        return await this.userRepo.findOne(idOrConditions);
      }
      case typeof idOrConditions === 'object': {
        return await this.userRepo.findOne(idOrConditions);
      }
    }
  }

  async findById(id: ObjectID) {
    const user = await this.userRepo.findOne(id);

    if (!user) throw new NotFoundException(`User with id ${id} not found`);

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

    Object.assign(user, updatedUser);
    return await this.userRepo.save(user);
  }

  async remove(id: ObjectID) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.userRepo.remove(user);
  }
}
