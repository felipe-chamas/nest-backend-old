import { INestApplication } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger'

import { NftCollectionModule } from '@modules/nft-collection.module'
import { NftGameModule } from '@modules/nft-game.module'
import { NftModule } from '@modules/nft.module'
import { UserModule } from '@modules/user.module'

export class Swagger {
  static init(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Blockchain API')
      .setDescription(
        [
          'Welcome to the Blockchain API documentation.',
          'Additional flowcharts are provided for a better understanding of user stories',
          '<ol>',
          '<li><a href="https://theharvest.gg/docs-create-wallet" target="_blank">Create wallet</a></li>',
          '<li><a href="https://theharvest.gg/docs-get-wallet-by-player" target="_blank">Get wallet by player</a></li>',
          '<li><a href="https://theharvest.gg/docs-get-nfts-by-player" target="_blank">Get NFTs by player</a></li>',
          '<li><a href="https://theharvest.gg/docs-unbox-nfts" target="_blank">Unbox NFTs</a></li>',
          '<li><a href="https://theharvest.gg/docs-get-nft-by-tokenid" target="_blank">Get NFT by <code>tokenId</code></a></li>',
          '<li><a href="https://theharvest.gg/docs-import-wallet" target="_blank">Import wallet</a></li>',
          '<li><a href="https://theharvest.gg/docs-transfer-har-nfts-to-wallet" target="_blank">Transfer $HAR/NFTs to wallet</a></li>',
          '</ol>'
        ].join('<br/>')
      )
      .setVersion('0.4')
      .addTag('Nfts')
      .addTag('Game Control')
      .addTag('Users')
      .build()

    const options: SwaggerDocumentOptions = {
      include: [UserModule, NftModule, NftCollectionModule, NftGameModule]
    }

    const document = SwaggerModule.createDocument(app, swaggerConfig, options)

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        operationsSorter: 'method'
      }
    })
  }
}
