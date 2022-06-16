import {
  Nft,
  NftClaim,
  NftCollection,
  Order,
  OrderHistory,
  User,
} from 'common/entities';
import { AssetIdDto, AssetTypeDto, ChainIdReference } from 'common/types';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

import { Keypair } from '@solana/web3.js';
import { AssetId, AssetType } from 'caip';

import NftCollectionData from './theharvestgame/nft-collection.json';
import NftClaimData from './theharvestgame/nft-claim.json';
import { faker } from '@faker-js/faker';
import { CreateNftCollectionDto } from '../../models/nft-collection';
import { Metadata } from '../../models/nft/interface';
import { CreateNftClaimDto } from 'models/nft-claim/dto/create-nft-claim.dto';
import { CreateNftDto } from 'models/nft';

interface NftCollectionInput {
  name: string;
  slug: string;
  icon: string;
  externalUrl: string;
}

interface NftClaimInput {
  metadata: Metadata;
  slug: string;
}

export default class TheHarvestGameSeeder implements Seeder {
  users: User[];

  nftCollections: NftCollection[];

  nftClaims: NftClaim[];

  nfts: Nft[];

  public async run(factory: Factory, connection: Connection): Promise<void> {
    this.users = await factory(User)({
      chainId: ChainIdReference.SOLANA_DEVNET,
    }).createMany(20);

    const nftCollectionRepo = connection.getRepository(NftCollection);
    this.nftCollections = nftCollectionRepo.create(
      NftCollectionData.map((data) => this.createNftCollection(data)),
    );
    this.nftCollections = await nftCollectionRepo.save(this.nftCollections);

    const nftClaimRepo = connection.getRepository(NftClaim);
    this.nftClaims = nftClaimRepo.create(
      NftClaimData.map((data) => this.createNftClaim(data)),
    );
    this.nftClaims = await nftClaimRepo.save(this.nftClaims);

    const nftRepo = connection.getRepository(Nft);
    this.nfts = nftRepo.create(
      this.nftClaims.map((data) => this.createNfts(data)).flat(),
    );
    this.nfts = await nftClaimRepo.save(this.nfts);

    const orders = await factory(Order)({
      nfts: this.nfts,
      users: this.users,
    }).createMany(50);

    await factory(OrderHistory)({
      orders,
      users: this.users,
    }).createMany(100);
  }

  private createNftCollection(
    data: NftCollectionInput,
  ): CreateNftCollectionDto {
    const mintAddress = Keypair.generate().publicKey.toBase58();

    const assetType = new AssetType({
      chainId: ChainIdReference.SOLANA_DEVNET,
      assetName: {
        namespace: 'NonFungible',
        reference: mintAddress,
      },
    });
    const assetTypes = [assetType.toJSON() as AssetTypeDto];
    const imageBaseUri = `https://api.theharvestgame.xyz/api/nft/solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1/NonFungible:${mintAddress}/`;

    return {
      ...data,
      assetTypes,
      imageBaseUri,
    };
  }

  private createNftClaim(data: NftClaimInput): CreateNftClaimDto {
    const nftCollectionId = this.nftCollections.find(
      (nftCollection) => nftCollection.slug === data.slug,
    ).id;

    delete data.slug;

    return {
      metadata: data.metadata,
      nftCollectionId,
      merkleProofs: {},
      merkleRoot: '',
    };
  }

  private createNfts(data: NftClaim): CreateNftDto[] {
    const nftCollection = this.nftCollections.find(
      (nftCollection) =>
        nftCollection.id.toString() === data.nftCollectionId.toString(),
    );

    const count =
      nftCollection.slug === 'emote'
        ? faker.datatype.float({ min: 1, max: 10, precision: 1 })
        : 1;

    return Array(count)
      .fill(null)
      .map(() => this.createNft(data));
  }

  private createNft(data: NftClaim): CreateNftDto {
    const nftCollection = this.nftCollections.find(
      (nftCollection) =>
        nftCollection.id.toString() === data.nftCollectionId.toString(),
    );

    const userId = faker.helpers.arrayElement(this.users).id;
    const assetType = nftCollection.assetTypes[0];
    const tokenId = Keypair.generate().publicKey.toBase58();

    const assetId = new AssetId({
      ...assetType,
      tokenId,
    });
    const assetIds = [assetId.toJSON() as AssetIdDto];

    return {
      userId,
      assetIds,
      metadata: data.metadata,
      nftCollectionId: data.nftCollectionId,
    };
  }
}
