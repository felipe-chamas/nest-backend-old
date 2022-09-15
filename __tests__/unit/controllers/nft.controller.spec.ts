import { Test, TestingModule } from '@nestjs/testing'

import { NftController } from '@controllers/nft.controller'
import { NftCollectionService } from '@services/nft-collection.service'
import { EvmService } from '@services/utils/evm.service'
import { SolanaService } from '@services/utils/solana.service'

describe('NftController', () => {
  let controller: NftController
  const nftCollectionService = NftCollectionService.prototype

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        {
          provide: NftCollectionService,
          useValue: nftCollectionService
        },
        {
          provide: EvmService,
          useValue: EvmService
        },
        {
          provide: SolanaService,
          useValue: SolanaService
        }
      ]
    }).compile()

    controller = module.get<NftController>(NftController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
