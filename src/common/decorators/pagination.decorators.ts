import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

type Sort = { [key: string]: 1 | -1 }

type PaginationQuery = Array<{ $sort: Sort } | { $skip: number } | { $limit: number }>

export interface Pagination {
  query: PaginationQuery
}

const DEFAULT_NUMBER_OF_RESULTS = 10

export const GetPagination = createParamDecorator((data, ctx: ExecutionContext): Pagination => {
  const req: Request = ctx.switchToHttp().getRequest()

  const query: PaginationQuery = []

  if (req.query.sort) {
    const sort = req.query.sort.toString()
    query.push({
      $sort: {
        [sort.slice(1)]: sort[0] === '-' ? -1 : sort[0] === '+' ? 1 : 1
      }
    })
  }

  query.push(req.query.skip ? { $skip: parseInt(req.query.skip.toString()) } : { $skip: 0 })

  query.push(
    req.query.limit
      ? { $limit: parseInt(req.query.limit.toString()) }
      : { $limit: DEFAULT_NUMBER_OF_RESULTS }
  )

  delete req.query.sort
  delete req.query.skip
  delete req.query.limit

  return { query }
})
