import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ObjectID,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Metadata } from '../../models/nft/interface';
import { MerkleProofs } from '../../models/nft-claim/types';
import { NftCollection } from './nft-collection.entity';

@Entity()
@Index(['nftCollectionId'])
export class NftClaim {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  merkleRoot: string;

  @Column()
  merkleProofs: MerkleProofs;

  @Column()
  metadata: Metadata;

  @Column()
  nftCollectionId: NftCollection['id'];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
