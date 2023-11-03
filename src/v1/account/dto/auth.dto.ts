import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinDate,
} from 'class-validator';

export class CreateAccountDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
export class DeactivateAPIKeyDTO {
  @IsString()
  @IsNotEmpty()
  api_key: string;

  @MinDate(() => new Date(Date.now()))
  @IsDate()
  @IsOptional()
  date: string;
}

export class OrganizationIdDTO
  implements Pick<CreateAccountDTO, 'organizationId'>
{
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
