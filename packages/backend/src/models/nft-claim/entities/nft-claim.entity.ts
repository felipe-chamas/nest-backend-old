import { Column, Entity, Index, ObjectID, ObjectIdColumn } from 'typeorm';
import { Metadata } from '../../nft/interface';

@Entity()
@Index(['nftCollectionId'])
export class NftClaim {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  merkleRoot: string;

  @Column()
  merkleProofs: Record<string, { tokens: string; proof: string[] }>;

  @Column()
  metadata: Metadata;

  @Column({ unique: true })
  nftCollectionId: string;
}
