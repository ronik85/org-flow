import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Organization } from './entities/organization.entity';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private readonly dataSource: DataSource) {}

  async createOrganizationWithUser(dto: OnboardOrganizationDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const organization = new Organization();
      organization.name = dto.organization.name;
      
      const savedOrg = await queryRunner.manager.save(organization);

      const user = new User();
      user.name = dto.user.name;
      user.email = dto.user.email;
      user.password = await bcrypt.hash(dto.user.password, 10);
      user.organization = savedOrg;

      const savedUser = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();

      return {
        organization: savedOrg,
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      
      throw new InternalServerErrorException('Transaction failed');
    } finally {
      await queryRunner.release();
    }
  }
}
