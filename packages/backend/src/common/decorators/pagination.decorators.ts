export interface Pagination {
  skip?: number;
  take?: number;
  sort?: { field: string; by: 'ASC' | 'DESC' }[];
  search?: { field: string; value: string }[];
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const DEFAULT_NUMBER_OF_RESULTS = 10;

export const GetPagination = createParamDecorator(
  (data, ctx: ExecutionContext): Pagination => {
    const req: Request = ctx.switchToHttp().getRequest();

    const paginationParams: Pagination = {
      skip: 0,
      take: DEFAULT_NUMBER_OF_RESULTS,
      sort: [],
      search: [],
    };

    if (req.query.skip)
      paginationParams.skip = parseInt(req.query.skip.toString());

    if (req.query.take)
      paginationParams.take = parseInt(req.query.take.toString());

    // create array of sort
    if (req.query.sort) {
      const sortArray = req.query.sort.toString().split(',');
      paginationParams.sort = sortArray.map((sortItem) => {
        const sortBy = sortItem[0];
        switch (sortBy) {
          case '-':
            return {
              field: sortItem.slice(1),
              by: 'ASC',
            };
          case '+':
            return {
              field: sortItem.slice(1),
              by: 'DESC',
            };
          default:
            return {
              field: sortItem.trim(),
              by: 'DESC',
            };
        }
      });
    }

    // create array of search
    if (req.query.search) {
      const searchArray = req.query.search.toString().split(',');
      paginationParams.search = searchArray.map((searchItem) => {
        const field = searchItem.split(':')[0];
        const value = searchItem.split(':')[1];
        return {
          field,
          value,
        };
      });
    }

    return paginationParams;
  }
);
