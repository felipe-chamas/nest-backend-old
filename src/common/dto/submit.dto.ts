import { IsString } from 'class-validator'

export class SubmitSignedAgreementDto {
  @IsString()
  signature: string
}
