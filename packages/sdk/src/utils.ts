import { BigNumberish, BigNumber } from 'ethers';
import { PaginationParams } from './types';

export const listAsyncItemsWithPagination = async <T>(
  getTotalSize: () => Promise<BigNumber>,
  getByIndex: (index: BigNumberish) => Promise<T>,
  params?: PaginationParams,
) => {
  const totalSize = await getTotalSize();
  // initialize params with default values
  const _params: PaginationParams = {
    toIndex: totalSize,
    fromIndex: 0,
    ...(params || {}),
  };
  const fromIndex = BigNumber.from(_params.fromIndex);
  const toIndex = BigNumber.from(_params.toIndex);
  let i = fromIndex;
  const items = [] as T[];
  while (i <= toIndex && i < totalSize) {
    const item = await getByIndex(i);
    items.push(item);
    i = i.add(1);
  }
  return items;
};

