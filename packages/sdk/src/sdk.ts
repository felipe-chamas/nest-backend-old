import { AccountId } from 'caip';

import { Signer } from './types';
import {
  NFT,
  NFTClaim,
  Utils,
  GameToken,
  NFTUnbox,
  AccessControl,
} from './services';

export class SDK {
  private readonly signer: Signer;

  constructor(signer: Signer) {
    this.signer = signer;
  }

  gameToken = (accountId: AccountId) =>
    GameToken.create(this.signer, accountId);

  nftClaim = (accountId: AccountId) => NFTClaim.create(this.signer, accountId);

  accessControl = (accountId: AccountId) =>
    AccessControl.create(this.signer, accountId);

  utils = () => Utils.create(this.signer);

  nft = (accountId: AccountId) => NFT.create(this.signer, accountId);

  nftUnbox = (accountId: AccountId) => NFTUnbox.create(this.signer, accountId);
}
