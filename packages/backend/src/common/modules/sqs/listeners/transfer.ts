import { ethers } from 'ethers';
import { parseLogs, ParsiqEvent } from '../sqs.service';
import { ConfigService } from '@nestjs/config';
import { logger } from 'common/providers/logger';
import { getRepository } from 'typeorm';
import { Nft, NftCollection, User } from 'common/entities';
import { UserService } from 'models/user';
import { NftService } from 'models/nft';
import { NftCollectionService } from 'models/nft-collection';

const config = new ConfigService();

export default async function transfer(
  parsiqEvent: ParsiqEvent
): Promise<void> {
  const jsonRpcProvider =
    config.get<string>('blockchain.jsonRpcProvider') ||
    process.env.JSON_RPC_PROVIDER;
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  const receipt = await provider.waitForTransaction(parsiqEvent.tx);
  const logs = parseLogs(receipt.logs);
  const transferLogs = logs.filter((log) => log.event.name === 'Transfer');

  for (const log of transferLogs) {
    const contractAddress = log.address;
    const { from, to, tokenId } = log.event.args;

    logger.info({ from, to, tokenId });

    const userRepo = getRepository(User, config.get<string>('database.dbName'));
    const nftRepo = getRepository(Nft, config.get<string>('database.dbName'));
    const nftCollectionRepo = getRepository(
      NftCollection,
      config.get<string>('database.dbName')
    );

    const userService = new UserService(userRepo);
    const nftService = new NftService(nftRepo);
    const nftCollectionService = new NftCollectionService(nftCollectionRepo);

    const [userTo, nftCollection] = await Promise.all([
      userService.findOneBy({ account: to }),
      nftCollectionService.findOneBy({ contractAddress }),
    ]);

    const { id: userId } = userTo
      ? userTo
      : await userService.create({ account: to });
    logger.debug({ userTo, nftCollection });

    const nft = await nftService.findOneBy({
      tokenId: tokenId,
      nftCollectionId: nftCollection.id,
    });
    logger.debug({ nft });

    const nftUpdated = await nftService.update(nft.id, { userId: userTo.id });
    console.debug(nftUpdated);
  }
}
