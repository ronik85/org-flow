import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }
}
