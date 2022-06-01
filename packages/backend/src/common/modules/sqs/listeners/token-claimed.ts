import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

import { getRepository } from 'typeorm';

import { parseLogs, ParsiqEvent } from '../sqs.service';
import { logger } from 'common/providers/logger';
import { NftClaim } from 'common/entities/nft-claim.entity';
import { NftCollection, NftCollectionService } from 'models/nft-collection';
import { UserService } from 'models/user/services';
import { Nft, NftService } from 'models/nft';
import { User } from 'common/entities';
import { NftClaimService } from 'models/nft-claim/services/nft-claim.service';
import { AccountId } from 'caip';

const config = new ConfigService();

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

    logger.info({ account, merkleRoot, tokenId });
    const userRepo = getRepository(User, config.get<string>('database.dbName'));
    const nftRepo = getRepository(Nft, config.get<string>('database.dbName'));
    const nftClaimRepo = getRepository(
      NftClaim,
      config.get<string>('database.dbName')
    );
    const nftCollectionRepo = getRepository(
      NftCollection,
      config.get<string>('database.dbName')
    );
    const userService = new UserService(userRepo);
    const nftService = new NftService(nftRepo);
    const nftClaimService = new NftClaimService(nftClaimRepo);
    const nftCollectionService = new NftCollectionService(nftCollectionRepo);

    const [user, nftCollection, nftClaim] = await Promise.all([
      userService.findByAccount(new AccountId(account)),
      nftCollectionService.findOne({ contractAddress }),
      nftClaimService.findOne({ merkleRoot }),
    ]);
    logger.debug({ user, nftCollection, nftClaim });

    const meta = nftClaim.metadata;
    const metadata = {
      name: meta.name,
      description: meta.description,
      image: meta.image,
      external_url: `${nftCollection.externalUrl}${tokenId}`,
      attributes: meta.attributes,
    };

    const nft = await nftService.create({
      metadata,
      userId: user.id,
      tokenId: tokenId,
      nftCollectionId: nftCollection.id,
    });
    logger.debug(nft);
  }
}
