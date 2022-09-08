import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { SortOrder } from 'mongoose'

export interface Pagination {
  skip: number
  limit: number
  sort: { [key: string]: SortOrder }
}

const DEFAULT_NUMBER_OF_RESULTS = 10

export const GetPagination = createParamDecorator((data, ctx: ExecutionContext): Pagination => {
  const req: Request = ctx.switchToHttp().getRequest()

  const pagination: Pagination = {
    skip: 0,
    limit: DEFAULT_NUMBER_OF_RESULTS,
    sort: {}
  }

  if (req.query.sort) {
    const sorts = req.query.sort.toString().split(',')
    sorts.forEach((sort) => {
      const [sortValue, sortOrder] = sort.split('-')
      if (
        sortOrder !== 'asc' &&
        sortOrder !== 'desc' &&
        sortOrder !== 'ascending' &&
        sortOrder !== 'descending'
      )
        throw new BadRequestException(`Expected value of SortOrder but received: ${sortOrder}`)
      pagination.sort[sortValue] = sortOrder as SortOrder
    })
  }

  if (req.query.skip) {
    pagination.skip = parseInt(req.query.skip.toString())
  }

  if (req.query.limit) {
    pagination.limit = parseInt(req.query.limit.toString())
  }

  delete req.query.sort
  delete req.query.skip
  delete req.query.limit

  return pagination
})
