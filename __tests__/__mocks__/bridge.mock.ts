import { BridgeDocument } from '@common/schemas/bridge.schema'
import { BridgeService } from '@services/bridge.service'

import { mockWithMongooseMethodChaining } from './utils'

export const mockBridge: Partial<BridgeDocument> = {
  _id: '5864b7f6b9d9b8b2b8a9b9b9',
  txSource: '0x1234567890'
}

export const mockBridgeService: Partial<BridgeService> = {
  findOne: jest.fn().mockImplementation(async ({ txSource }: { txSource: string }) => {
    if (txSource === mockBridge.txSource) return mockBridge
    return null
  }),
  update: jest.fn(),
  remove: jest.fn(),
  create: jest.fn().mockReturnValue(mockBridge)
}

export const bridgeModelMockFactory = jest.fn().mockImplementation(() => ({
  findOne: mockWithMongooseMethodChaining(mockBridge),
  findOneAndUpdate: mockWithMongooseMethodChaining(mockBridge),
  find: mockWithMongooseMethodChaining(mockBridge),
  deleteOne: mockWithMongooseMethodChaining(undefined),
  save: jest.fn().mockReturnValue(mockBridge),
  create: jest.fn().mockReturnValue(mockBridge)
}))
