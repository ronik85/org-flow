import { IsInt, IsString, Matches, Min, validateSync } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';

export class EnvironmentVariables {
  @IsString()
  APPNAME: string;

  @IsString()
  APPVERSION: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  APP_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
