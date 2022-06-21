import { ApiProperty } from '@nestjs/swagger';

export class NftClaimDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  merkleRoot: string;

  @ApiProperty()
  merkleProofs: Record<string, { tokens: string; proof: string[] }>;

  @ApiProperty()
  metadata: {
    name: string;
    description: string;
    image: string;
    external_url?: string;
    attributes?: { trait_type: string; value: string }[];
  };

  @ApiProperty()
  nftCollectionId: string;

  @ApiProperty()
  createdAt: Date;
}
