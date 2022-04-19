import { MockContract, smock } from '@defi-wonderland/smock';
import { ERC20Mock, ERC20Mock__factory, TokenSale, TokenSale__factory } from '../../typechain';
import { ONE_TOKEN } from './constants';

export async function deployERC20(): Promise<MockContract<ERC20Mock>> {
  const factory = await smock.mock<ERC20Mock__factory>('ERC20Mock');

  return await factory.deploy('Test', 'MCK', 18, 100_000n * ONE_TOKEN);
}

export async function deployTokenSaleMock(): Promise<MockContract<TokenSale>> {
  const factory = await smock.mock<TokenSale__factory>('TokenSale');

  return await factory.deploy();
}
