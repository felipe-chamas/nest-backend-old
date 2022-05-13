import { BigNumberish, BigNumber } from 'ethers';

import { PaginationParams } from './types';

const MAX_REQUESTS_AT_MOMENT = BigNumber.from(5);

export const listAsyncItemsWithPagination = async <T>(
  getTotalSize: () => Promise<BigNumber>,
  getByIndex: (index: BigNumberish) => Promise<T>,
  params?: PaginationParams,
) => {
  const totalSize = await getTotalSize();
  const offset = BigNumber.from(params?.offset ?? 0);
  const limitRelatedToTotalSize = totalSize.sub(offset);
  let limit = limitRelatedToTotalSize;
  if (params && limit.gt(params.limit)) {
    limit = BigNumber.from(params.limit);
  }
  let itemsFetched = BigNumber.from(0);
  const result = [] as T[];
  while (itemsFetched.lt(limit)) {
    const itemsLeft = limit.sub(itemsFetched);
    const fetchThisTimeCount =
      itemsLeft.lt(MAX_REQUESTS_AT_MOMENT) ?
      itemsLeft : MAX_REQUESTS_AT_MOMENT;
    const promisedItems: Promise<T>[] = [];
    let promisesCreated = BigNumber.from(0);
    while (promisesCreated.lt(fetchThisTimeCount)) {
      const promise = getByIndex(
        offset.add(itemsFetched).add(promisesCreated),
      );
      promisesCreated = promisesCreated.add(1);
      promisedItems.push(promise);
    }
    const items = await Promise.all(promisedItems);
    itemsFetched = itemsFetched.add(items.length);
    result.push(...items);
  }
  return result;
};

