import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';
import { Nft } from 'models/nft/entities/nft.entity';
import { NftService } from 'models/nft/nft.service';
import { getRepository } from 'typeorm';
import { NftCollection } from 'models/nft-collection/entities/nft-collection.entity';
import { NftCollectionService } from 'models/nft-collection/nft-collection.service';
import { getMetadataFromRoot } from './token-claimed-logic';
import { User } from 'models/user/entities/user.entity';
import { UserService } from 'models/user/user.service';
import { ParsiqEvent } from '../sqs.service';
import { logger } from 'common/providers/logger';

const config = new ConfigService();

const TokenClaimedABI = [
  'event TokenClaimed(address indexed account, bytes32 indexed merkleRoot, uint256 tokenId)',
];
const TransferABI = [
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

function parseLogs(logs: ethers.providers.Log[]): Array<{
  event: ethers.utils.LogDescription;
  address: string;
}> {
  const iTokenClaimed = new ethers.utils.Interface(TokenClaimedABI);
  const iTransfer = new ethers.utils.Interface(TransferABI);
  return logs
    .map((log) => {
      let event: ethers.utils.LogDescription;
      try {
        event = iTokenClaimed.parseLog(log);
        // eslint-disable-next-line no-empty
      } catch (err) {}
      if (!event) {
        try {
          event = iTransfer.parseLog(log);
          // eslint-disable-next-line no-empty
        } catch (err) {}
      }
      return {
        event,
        address: log.address,
      };
    })
    .filter((x) => x.event);
}

export default async function tokenClaimed(
  parsiqEvent: ParsiqEvent
): Promise<void> {
  const jsonRpcProvider =
    config.get<string>('blockchain.jsonRpcProvider') ||
    process.env.JSON_RPC_PROVIDER;
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  const receipt = await provider.waitForTransaction(parsiqEvent.tx);
  const logs = parseLogs(receipt.logs);
  const transferLog = logs.find((log) => log.event.name === 'Transfer');
  const tokenClaimedLogs = logs.filter(
    (log) => log.event.name === 'TokenClaimed'
  );
  const contractAddress = transferLog.address;

  for (const log of tokenClaimedLogs) {
    const { account, merkleRoot, tokenId } = log.event.args;

    logger.info(account, merkleRoot, tokenId);
    const userRepo = getRepository(User, config.get<string>('database.dbName'));
    const nftRepo = getRepository(Nft, config.get<string>('database.dbName'));
    const nftCollectionRepo = getRepository(
      NftCollection,
      config.get<string>('database.dbName')
    );
    const userService = new UserService(userRepo);
    const nftService = new NftService(nftRepo);
    const nftCollectionService = new NftCollectionService(nftCollectionRepo);

    let user: User;
    user = await userService.findOne({ address: [account] });
    if (!user) {
      user = (await userService.create({ address: [account] })).user;
    }
    logger.debug(user);

    const nftCollection = await nftCollectionService.findOne({
      contractAddress,
    });
    logger.debug(nftCollection);

    const meta = getMetadataFromRoot(merkleRoot);
    const metadata = {
      name: meta.name,
      description: meta.description,
      image: `${nftCollection.imageBaseUri}${meta.image}`,
      external_url: `${nftCollection.externalUrl}${tokenId}`,
      attributes: meta.attributes,
    };

    const nft = await nftService.create({
      metadata,
      userId: user.id.toString(),
      tokenId: tokenId.toString(),
      nftCollectionId: nftCollection.id.toString(),
    });
    logger.debug(nft);
  }
}
