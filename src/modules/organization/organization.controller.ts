import { Body, Controller, Post } from '@nestjs/common';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post('onboard')
  async onboard(@Body() dto: OnboardOrganizationDto) {
    return this.organizationService.createOrganizationWithUser(dto);
  }
}
