import { ethers } from 'ethers';
import { parseLogs, ParsiqEvent } from '../queue.service';
import { ConfigService } from '@nestjs/config';
import { logger } from 'common/providers/logger';
import { getRepository } from 'typeorm';
import { Nft, User } from 'common/entities';
import { UserService } from 'models/user';
import { NftService } from 'models/nft';
import { AccountId, AssetId, ChainId } from 'caip';

const config = new ConfigService();

// TODO: dynamic with chain ID
export default async function transfer(
  parsiqEvent: ParsiqEvent
): Promise<void> {
  const chainId = new ChainId(parsiqEvent.chainId);
  const jsonRpcProvider =
    config.get<string>('blockchain.jsonRpcProvider') ||
    process.env.JSON_RPC_PROVIDER;
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  const receipt = await provider.waitForTransaction(parsiqEvent.tx);
  const logs = parseLogs(receipt.logs);
  const transferLogs = logs.filter((log) => log.event.name === 'Transfer');

  for (const log of transferLogs) {
    const { from, to, tokenId } = log.event.args;

    const assetName = {
      namespace: 'erc721',
      reference: log.address,
    };

    const assetId = new AssetId({
      chainId,
      assetName,
      tokenId,
    });

    logger.info({ from, to, tokenId });

    const userRepo = getRepository(User, config.get<string>('database.dbName'));
    const nftRepo = getRepository(Nft, config.get<string>('database.dbName'));

    const userService = new UserService(userRepo);
    const nftService = new NftService(nftRepo);

    const toAccountId = new AccountId(to);

    const [userTo] = await Promise.all([
      userService.findByAccountId(toAccountId),
    ]);

    const { id: userId } = userTo
      ? userTo
      : await userService.create({ accountIds: [toAccountId.toJSON()] });
    logger.debug({ userTo });

    const nft = await nftService.findByAssetId(assetId);
    logger.debug({ nft });

    const nftUpdated = await nftService.update(nft.id, { userId });
    console.debug(nftUpdated);
  }
}
