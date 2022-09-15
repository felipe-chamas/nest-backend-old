export function mockWithMongooseMethodChaining<T>(result: T) {
  return jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnValue(Array.isArray(result) ? result.length : 1),
    exec: jest.fn().mockReturnValue(result)
  })
}
