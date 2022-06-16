import {
  Nft,
  NftClaim,
  NftCollection,
  Order,
  OrderHistory,
  User,
} from 'common/entities';
import { Factory, Seeder } from 'typeorm-seeding';

export default class RandomSeeder implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const users = await factory(User)().createMany(20);
    const nftCollections = await factory(NftCollection)().createMany(5);
    const nftClaims = await factory(NftClaim)({
      users,
      nftCollections,
    }).createMany(10);

    const nfts = await factory(Nft)({
      users,
      nftClaims,
    }).createMany(50);

    const orders = await factory(Order)({ users, nfts }).createMany(30);
    await factory(OrderHistory)({
      orders,
      users,
    }).createMany(100);
  }
}
