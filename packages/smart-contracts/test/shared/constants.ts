import { constants } from 'ethers';

export const ONE_TOKEN = 10n ** 18n;
export const MAX_UINT256 = 2n ** 256n - 1n;
export const AddressZero = constants.AddressZero;
export const ONE_DAY = 86400;
export const ONE_HOUR = 3600;
export const EMPTY_MERKLE_ROOT = '0x'.padEnd(66, '0');
export const MAX_MARKETPLACE_ERC20_FEE_PERCENT = 100000; // 10%
