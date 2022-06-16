import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { signERC2612Permit } from 'eth-permit';
import { BigNumberish, BytesLike, BigNumber } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { AtLeast } from '../../../tasks/types';
import { MarketplaceMock } from '../../../typechain';
import { Assets, Orders, Permits } from '../../../typechain/contracts/marketplace/Marketplace';
import { AddressZero } from '../../shared/constants';
import { AssetsTypes } from '../../shared/types';
import { OrderSigner, signERC4494Permit } from '../../shared/utils';

export const MARKETPLACE_ERC20_FEE = 20000n; // 2%
export const MARKETPLACE_NFT_FEE = ethers.utils.parseEther('1'); // 1 token

export const getOrderFee = (tokens: BigNumberish, nfts: number) =>
  BigNumber.from(tokens)
    .mul(MARKETPLACE_ERC20_FEE)
    .div(100n * 10_000n)
    .add(BigNumber.from(MARKETPLACE_NFT_FEE.mul(nfts)))
    .toBigInt();

export const createOrder = ({
  maker,
  makeAssets,
  taker = AddressZero,
  takeAssets,
  salt = new Date().getTime(),
  start = 0,
  end = 0,
}: AtLeast<Orders.OrderStruct, 'maker' | 'makeAssets' | 'takeAssets'>): Orders.OrderStruct => ({
  maker,
  makeAssets,
  taker,
  takeAssets,
  salt,
  start,
  end,
});

export const createTakerOrder = (taker: string, makerOrder: Orders.OrderStruct): Orders.OrderStruct => ({
  maker: taker,
  makeAssets: [...makerOrder.takeAssets],
  taker: makerOrder.maker,
  takeAssets: [...makerOrder.makeAssets],
  salt: new Date().getTime(),
  start: 0,
  end: 0,
});

/**
 * Creates ERC721 Asset structure.
 * @param token
 * @param value
 */
export const makeERC20Asset = (token: string, value: BigNumberish) =>
  makeAsset(AssetsTypes.ERC20, defaultAbiCoder.encode(['address'], [token]), value);

/**
 * Creates ERC721 Asset structure.
 * @param token
 * @param tokenId
 * @param value
 */
export const makeERC721Asset = (token: string, tokenId: BigNumberish, value: BigNumberish = 1) =>
  makeAsset(AssetsTypes.ERC721, defaultAbiCoder.encode(['address', 'uint256'], [token, tokenId]), value);

export const decodeERC20Asset = async (asset: Assets.AssetStruct) => ({
  token: defaultAbiCoder.decode(['address'], await asset.id.data)[0],
  value: asset.value,
});

export const decodeERC721Asset = async (asset: Assets.AssetStruct) => {
  const result = defaultAbiCoder.decode(['address', 'uint256'], await asset.id.data);
  return {
    token: result[0],
    tokenId: BigNumber.from(result[1]),
  };
};

/**
 * Creates Asset structure.
 * @param assetClass
 * @param data
 * @param value
 */
export const makeAsset = (assetClass: BytesLike, data: BytesLike, value: BigNumberish) =>
  ({
    id: { class: assetClass, data },
    value,
  } as Assets.AssetStruct);

export const makePermits = async (
  signer: SignerWithAddress,
  spender: string,
  assets: Assets.AssetStruct[],
): Promise<Permits.PermitStruct[]> => {
  const result: Permits.PermitStruct[] = [];
  for (const asset of assets) {
    result.push(await makePermit(signer, spender, asset));
  }
  return result;
};

export async function makePermit(signer: SignerWithAddress, spender: string, asset: Assets.AssetStruct) {
  if (asset.id.class === AssetsTypes.ERC20) {
    const data = await decodeERC20Asset(asset);
    const permit = await signERC2612Permit(signer, data.token, signer.address, spender, data.value.toString(10));
    return {
      asset,
      deadline: permit.deadline,
      signature: ethers.utils.joinSignature({
        r: permit.r,
        s: permit.s,
        v: permit.v,
      }),
    };
  }

  if (asset.id.class === AssetsTypes.ERC721) {
    const data = await decodeERC721Asset(asset);
    const permit = await signERC4494Permit(signer, data.token, spender, data.tokenId.toString());

    return {
      asset,
      deadline: permit.deadline,
      signature: permit.sig,
    };
  }

  throw new Error(`Unsupported Asset class ${asset.id.class}`);
}

export async function matchOrders(
  marketplace: MarketplaceMock,
  left: Orders.OrderStruct,
  maker: SignerWithAddress,
  right: Orders.OrderStruct,
  taker: SignerWithAddress,
  orderSigner: OrderSigner,
) {
  return await marketplace.matchOrders(
    left,
    await orderSigner.signOrder(maker, left),
    right,
    await orderSigner.signOrder(taker, right),
    { gasLimit: 10_000_000 },
  );
}

export async function matchOrdersWithPermits(
  marketplace: MarketplaceMock,
  left: Orders.OrderStruct,
  maker: SignerWithAddress,
  right: Orders.OrderStruct,
  taker: SignerWithAddress,
  makerPermits: Permits.PermitStruct[],
  takerPermits: Permits.PermitStruct[],
  orderSigner: OrderSigner,
) {
  return await marketplace.matchOrdersWithPermits(
    left,
    await orderSigner.signOrder(maker, left),
    right,
    await orderSigner.signOrder(taker, right),
    makerPermits,
    takerPermits,
    { gasLimit: 10_000_000 },
  );
}

export async function matchOrdersWithPermitsAndSenderPermit(
  marketplace: MarketplaceMock,
  left: Orders.OrderStruct,
  maker: SignerWithAddress,
  right: Orders.OrderStruct,
  taker: SignerWithAddress,
  makerPermits: Permits.PermitStruct[],
  takerPermits: Permits.PermitStruct[],
  senderPermit: Permits.PermitStruct,
  orderSigner: OrderSigner,
) {
  return await marketplace.matchOrdersWithPermitsAndSenderPermit(
    left,
    await orderSigner.signOrder(maker, left),
    right,
    await orderSigner.signOrder(taker, right),
    makerPermits,
    takerPermits,
    senderPermit,
    { gasLimit: 10_000_000 },
  );
}
