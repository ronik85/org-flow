import { Type } from 'class-transformer';
import { IsDefined, ValidateNested } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { CreateOrganizationDto } from './create-organization.dto';

export class OnboardOrganizationDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateOrganizationDto)
  organization: CreateOrganizationDto;

  @IsDefined()
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;
}
