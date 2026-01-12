import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailAlreadyExistsException } from 'src/common/exceptions/email-already-exists.exception';
import { UserNotFoundException } from 'src/common/exceptions/user-not-found.exception';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

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
      throw new UserNotFoundException(id);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const alreadyCreatedUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (alreadyCreatedUser) throw new EmailAlreadyExistsException();
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }
}
