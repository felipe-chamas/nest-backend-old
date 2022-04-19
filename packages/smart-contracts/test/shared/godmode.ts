import { ethers } from 'hardhat';
import { GodModeTokenSale } from '../../typechain';

export async function deployGodModeTokenSale(): Promise<GodModeTokenSale> {
  const factory = await ethers.getContractFactory('GodModeTokenSale');

  return factory.deploy();
}
