import {
  IsDateString,
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
  currentDatePlusFiveMilliseconds = new Date(Date.now() + 1 * 5000);

  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsDateString()
  @IsOptional()
  date?: Date = this.currentDatePlusFiveMilliseconds;
}

export class OrganizationIdDTO
  implements Pick<CreateAccountDTO, 'organizationId'>
{
  @IsUUID()
  @IsNotEmpty()
  organizationId: string;
}
