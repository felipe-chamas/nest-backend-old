import { ethers } from 'ethers';
import { clusterApiUrl, Connection } from '@solana/web3.js';

import {
  getEthereumJSONRPC,
  getSolanaCluster,
  parseLogs,
  ParsiqEvent,
} from '../queue.service';
import { logger } from 'common/providers/logger';
import { getMongoRepository } from 'typeorm';
import { Nft, User } from 'common/entities';
import { UserService } from 'models/user';
import { NftService } from 'models/nft';
import { AccountId, AssetId, AssetType } from 'caip';
import { ChainIdReference } from 'common/types';

const parseEthereumData = async (parsiqEvent: ParsiqEvent) => {
  const assetId = new AssetId(parsiqEvent.assetType);
  const jsonRpcProvider = getEthereumJSONRPC(assetId.chainId.reference);
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  const receipt = await provider.waitForTransaction(parsiqEvent.tx);
  const logs = parseLogs(receipt.logs);
  const transferLogsArgs = logs
    .filter((log) => log.event.name === 'Transfer')
    .map((log) => log.event.args);
  return transferLogsArgs;
};

const parseSolanaData = async (parsiqEvent: ParsiqEvent) => {
  const assetId = new AssetId(parsiqEvent.assetType);
  const network = getSolanaCluster(assetId.chainId.toString());
  const tokenId = assetId.assetName.reference;

  const connection = new Connection(clusterApiUrl(network));
  const transaction = await connection.getParsedTransaction(parsiqEvent.tx);

  const from = transaction.meta.preTokenBalances
    ?.filter((balance) => balance.mint === tokenId)
    .filter(
      (balance) =>
        balance.uiTokenAmount.uiAmount && balance.uiTokenAmount.uiAmount > 0,
    )[0]?.owner;

  const to = transaction.meta.postTokenBalances
    .filter((balance) => balance.mint === tokenId)
    .filter(
      (balance) =>
        balance.uiTokenAmount.uiAmount && balance.uiTokenAmount.uiAmount > 0,
    )[0]?.owner;

  if (!from || !to) throw new Error();

  return [{ from, to, tokenId }];
};

const parseData = async (parsiqEvent: ParsiqEvent) => {
  const assetType = new AssetType(parsiqEvent.assetType);
  const network = assetType.chainId.toString();

  switch (network) {
    case ChainIdReference.ETHEREUM_MAINNET:
    case ChainIdReference.BINANCE_MAINNET:
    case ChainIdReference.BINANCE_TESTNET:
    case ChainIdReference.GOERLI_TESTNET:
      return parseEthereumData(parsiqEvent);
    case ChainIdReference.SOLANA_MAINNET:
    case ChainIdReference.SOLANA_DEVNET:
    case ChainIdReference.SOLANA_TESTNET:
      return parseSolanaData(parsiqEvent);
    default:
      throw new Error(`Unimplemented network: ${network}`);
  }
};

export default async function transfer(
  parsiqEvent: ParsiqEvent,
): Promise<void> {
  const logs = await parseData(parsiqEvent);

  const assetType = new AssetType(parsiqEvent.assetType);
  const chainId = assetType.chainId;
  const assetName = assetType.assetName;

  for (const { from, to, tokenId } of logs) {
    const assetId = new AssetId({
      chainId,
      assetName,
      tokenId,
    });

    logger.info({ from, to, tokenId });

    const userRepo = getMongoRepository(User);
    const nftRepo = getMongoRepository(Nft);

    const userService = new UserService(userRepo);
    const nftService = new NftService(nftRepo);

    const toAccountId = new AccountId({
      chainId,
      address: to,
    });

    const [userTo] = await Promise.all([
      userService.findByAccountId(toAccountId),
    ]);

    const { id: userId } = userTo
      ? userTo
      : await userService.create({ accountIds: [toAccountId.toJSON()] });
    logger.debug({ userTo });

    const nft = await nftService.findByAssetId(assetId);
    logger.debug({ nft });

    const nftUpdated = await nftService.update(nft.id.toString(), { userId });
    console.debug(nftUpdated);
  }
}
