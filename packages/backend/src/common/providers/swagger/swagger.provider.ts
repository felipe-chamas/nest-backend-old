import { INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { NftCollectionModule } from 'models/nft-collection/nft-collection.module';
import { NftModule } from 'models/nft/nft.module';
import { UserModule } from 'models/user/user.module';

export class Swagger {
  static init(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Blockchain API')
      .setDescription(
        [
          'Use the Blockchain API to manage Nfts, NftCollections and Users.',
          '',
          'The data model of the Blockchain API is summarized in three main entities:',
          '<ul>',
          '<li>Nfts, digital assets from the game minted on the blockchain. Each Nft belongs to a NftCollection.</li>',
          '<li>NftCollections, grouping of Nfts from the same category (e.g., Battle Tags, Heroes, Pets, Boxes, these can be all seen as different collections depending on the specifics of the game). Each NftCollection has zero or more Nfts.</li>',
          '<li>Users, the players and investors owning digital assets of the game. Users have wallet information, as well as other profile information. Each User has zero or more Nfts.</li>',
          '</ul>',
        ].join('<br/>'),
      )
      .setVersion('1.1')
      .addTag('Nfts')
      .addTag('NftCollections')
      .addTag('Users')
      .build();

    const options: SwaggerDocumentOptions = {
      include: [UserModule, NftModule, NftCollectionModule],
    };

    const document = SwaggerModule.createDocument(app, swaggerConfig, options);

    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        operationsSorter: 'method',
      },
    });
  }
}
