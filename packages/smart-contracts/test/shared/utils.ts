import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumberish, ContractTransaction, Signer } from 'ethers';
import { defaultAbiCoder, hexDataSlice, solidityKeccak256, solidityPack, _TypedDataEncoder } from 'ethers/lib/utils';
import { TypedDataField } from 'ethers/node_modules/@ethersproject/abstract-signer';
import { ethers } from 'hardhat';
import { MerkleTree } from 'merkletreejs';
import {
  ERC721Upgradeable,
  IERC721MetadataUpgradeable__factory,
  NFTUnboxing,
  Staking,
  TokenSale,
  VRFCoordinatorV2Mock,
} from '../../typechain';
import { Assets, Orders } from '../../typechain/contracts/marketplace/Marketplace';
import { Domain, ERC4494PermitMessage } from './types';

export const getTransferEvent = async (tx: ContractTransaction, erc721: ERC721Upgradeable) => {
  const receipt = await tx.wait();
  const events = await erc721.queryFilter(erc721.filters.Transfer(), receipt.blockNumber);
  return events[0].args;
};

export const getRoundAdded = async (tx: ContractTransaction, tokenSale: TokenSale) => {
  const receipt = await tx.wait();
  const events = await tokenSale.queryFilter(tokenSale.filters.RoundAdded(), receipt.blockNumber);
  return events[0].args;
};

export const evmSnapshot = () => ethers.provider.send('evm_snapshot', []);
export const evmRevert = (id: string) => ethers.provider.send('evm_revert', [id]);
export const nextBlock = (timestamp = 0) => ethers.provider.send('evm_mine', timestamp > 0 ? [timestamp] : []);
export const increaseTime = async (seconds: number): Promise<void> => {
  const time = await currentTime();
  await nextBlock(time + seconds);
};
export const setNextBlockTimestamp = (timestamp: number) =>
  ethers.provider.send('evm_setNextBlockTimestamp', [timestamp]);

export const currentTime = async (): Promise<number> => {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
};

export const mineBlocks = (count: number) => ethers.provider.send('hardhat_mine', [BigInt(count).toString(16)]);

export const createAllowlistMerkleTree = (chainid: number, contract: string, accounts: string[]) => {
  if (accounts.length < 2) throw new Error('At least two accounts must be specified!');
  const leaves = accounts.map(x => createMerkleTreeLeaf(chainid, contract, x));
  return new MerkleTree(leaves, ethers.utils.keccak256, { sort: true });
};

export const createMerkleTreeLeaf = (chainid: number, contract: string, account: string) =>
  ethers.utils.solidityKeccak256(['uint256', 'address', 'address'], [chainid, contract, account]);

export const getSubscriptionCreatedEvent = async (tx: ContractTransaction, coordinator: VRFCoordinatorV2Mock) => {
  const receipt = await tx.wait();
  const events = await coordinator.queryFilter(coordinator.filters.SubscriptionCreated(), receipt.blockNumber);
  return events[0].args;
};

export const getUnboxedEvent = async (tx: ContractTransaction, nftUnboxing: NFTUnboxing) => {
  const receipt = await tx.wait();
  const events = await nftUnboxing.queryFilter(nftUnboxing.filters.Unboxed(), receipt.blockNumber);
  return events[0].args;
};

export const getStakeEvent = async (ptx: Promise<ContractTransaction>, staking: Staking) => {
  const events = await ptx.then(tx =>
    tx.wait().then(receipt => staking.queryFilter(staking.filters.Staked(), receipt.blockNumber)),
  );

  return events[0].args;
};
const NONCES_FN_SIG_HASH = '0x141a468c';
const MAX_INT = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// helper to sign using (spender, tokenId, nonce, deadline) EIP 712
export const signERC4494Permit = async function (
  provider: SignerWithAddress,
  token: string | Domain,
  spender: string,
  tokenId: string,
  nonce?: number,
  deadline: number | string = MAX_INT,
) {
  const tokenAddress = (token as Domain).verifyingContract || (token as string);

  const message: ERC4494PermitMessage = {
    spender,
    tokenId,
    nonce:
      nonce ??
      (await provider.call({
        to: tokenAddress,
        data: `${NONCES_FN_SIG_HASH}${BigInt(tokenId).toString(16).padStart(64, '0')}`,
      })),
    deadline: deadline ?? MAX_INT,
  };

  const domain = await getDomain(provider, token);
  const typedData = createTypedERC4494Data(message, domain);
  const sig = await signWithEthers(provider, typedData);

  return { sig, ...message };
};

const createTypedERC4494Data = (message: ERC4494PermitMessage, domain: Domain) => ({
  types: {
    Permit: [
      { name: 'spender', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Permit',
  domain,
  message,
});

const getDomain = async (provider: Signer, token: string | Domain): Promise<Domain> => {
  if (typeof token !== 'string') {
    return token as Domain;
  }

  const tokenAddress = token as string;

  const [name, chainId] = await Promise.all([getTokenName(provider, tokenAddress), provider.getChainId()]);

  return { name, version: '1', chainId, verifyingContract: tokenAddress };
};

const getTokenName = async (provider: Signer, token: string) =>
  await IERC721MetadataUpgradeable__factory.connect(token, provider).name();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const signWithEthers = async (signer: any, typeData: any): Promise<string> => {
  const rawSignature = await (signer.signTypedData
    ? signer.signTypedData(typeData.domain, typeData.types, typeData.message)
    : signer._signTypedData(typeData.domain, typeData.types, typeData.message));

  return rawSignature;
};

/**
 * Calculates ID by taking 4 byte of the provided string hashed value.
 * @param value Arbitrary string.
 */
export const solidityId = (value: string) => hexDataSlice(ethers.utils.id(value), 0, 4);

export class OrderSigner {
  private readonly encoder: _TypedDataEncoder;
  private readonly types: Record<string, TypedDataField[]>;
  constructor(private readonly chainId: BigNumberish, private readonly contractAddress: string) {
    // Order(address maker,Asset[] makeAssets,address taker,Asset[] takeAssets,uint256 salt,uint256 start,uint256 end)
    this.types = {
      Order: [
        { name: 'maker', type: 'address' },
        { name: 'makeAssets', type: 'Asset[]' },
        { name: 'taker', type: 'address' },
        { name: 'takeAssets', type: 'Asset[]' },
        { name: 'salt', type: 'uint256' },
        { name: 'start', type: 'uint256' },
        { name: 'end', type: 'uint256' },
      ],
      Asset: [
        // Asset(AssetId id,uint256 value)
        { name: 'id', type: 'AssetId' },
        { name: 'value', type: 'uint256' },
      ],
      AssetId: [
        // AssetId(bytes4 class,bytes data)
        { name: 'class', type: 'bytes4' },
        { name: 'data', type: 'bytes' },
      ],
    };
    this.encoder = new _TypedDataEncoder(this.types);
  }

  getOrderHash(order: Orders.OrderStruct) {
    return this.encoder.hashStruct('Order', order);
  }

  getAssetHash(asset: Assets.AssetStruct) {
    return this.encoder.hashStruct('Asset', asset);
  }

  getAssetsHash(assets: Assets.AssetStruct[]) {
    const hashedAssets = assets.map(x => this.getAssetHash(x));
    const encoded = solidityPack(['bytes32[]'], [hashedAssets]);
    return solidityKeccak256(['bytes'], [encoded]);
  }

  getOrderKeyHash(order: Orders.OrderStruct) {
    const encoded = defaultAbiCoder.encode(
      ['address', 'bytes32', 'bytes32', 'uint256'],
      [order.maker, this.getAssetsHash(order.makeAssets), this.getAssetsHash(order.takeAssets), order.salt],
    );
    return solidityKeccak256(['bytes'], [encoded]);
  }

  async signOrder(signer: SignerWithAddress, order: Orders.OrderStruct): Promise<string> {
    const domain = {
      chainId: this.chainId,
      verifyingContract: this.contractAddress,
      name: 'Marketplace',
      version: '1',
    };
    return await signer._signTypedData(domain, this.types, order);
  }
}
