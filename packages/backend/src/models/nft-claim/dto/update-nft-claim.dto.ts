import { IsObject, IsString } from 'class-validator';
import { Metadata } from '../../../models/nft/interface';

export class UpdateNftClaimDto {
  @IsString()
  merkleRoot: string;

  @IsObject()
  merkleProofs: Record<string, { tokens: string; proof: string[] }>;

  @IsObject()
  metadata: Metadata;

  @IsString()
  nftCollectionId: string;
}
