import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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
  apiKey: string;

  @IsDate()
  @IsOptional()
  date?: Date = new Date(Date.now());
}

export class OrganizationIdDTO
  implements Pick<CreateAccountDTO, 'organizationId'>
{
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
