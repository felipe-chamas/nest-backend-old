import { AddressLike, Signer } from './types';
import { ContractResolver } from './contract-resolver';
import { Utils, AccessControl, BaseServiceParams, GameToken } from './services';


export async function createSdk(signer: Signer) {
  const signerChainId = (await signer.getChainId()).toString();
  const signerAddress = await signer.getAddress();
  const contractResolver = new ContractResolver(signer);
  const params: BaseServiceParams = {
    signer,
    signerChainId,
    signerAddress,
    contractResolver,
  };
  const utils = new Utils(params);
  return {
    utils,
    createAccessControl: (aclAddress: AddressLike) =>
      new AccessControl(aclAddress, utils, params),
    createGameToken: (gameTokenAddress: AddressLike) =>
      new GameToken(gameTokenAddress, utils, params)._setup(),
  };
}

