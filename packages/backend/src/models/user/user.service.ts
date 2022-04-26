import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    return { user };
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async findOne(id: string) {
    return await this.userRepo.findOne(id);
  }

  async update(id: string, updatedUser: UpdateUserDto) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    Object.assign(user, updatedUser);
    return await this.userRepo.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return this.userRepo.remove(user);
  }
}
