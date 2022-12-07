import { ConfigService } from '@nestjs/config'
import { AssetType } from 'caip'

import { mockNftEvm, mockNftSolana } from './nft.mock'

export const mockConfigService: Partial<ConfigService> = {
  get: (config: string) => {
    switch (true) {
      case config === 'bridge.sourceAccountId':
        return '0xfefe'
      case config === 'bridge.destinationWalletId':
        return '6ddcbcc3-e242-4bb5-b4f3-3913ccba3e8d'
      case config === 'bridge.destinationAssetTypes':
        return [
          new AssetType({
            chainId: mockNftEvm.assetId.chainId,
            assetName: mockNftEvm.assetId.assetName
          }).toString()
        ]
      case config === 'bridge.destinationWalletMinimumBalance':
        return 0.1
      case config === 'bridge.sourceAssetTypes':
        return [
          new AssetType({
            chainId: mockNftSolana.assetId.chainId,
            assetName: mockNftSolana.assetId.assetName
          }).toString()
        ]
      default:
        return config
    }
  }
}
