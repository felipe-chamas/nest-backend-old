import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Connection } from 'mongoose'
import MongooseAutoPopulate from 'mongoose-autopopulate'
import MongooseDelete from 'mongoose-delete'

import { logger } from '@common/providers/logger'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('mongo_uri'),
        connectionFactory: (connection: Connection) => {
          connection.plugin(MongooseAutoPopulate)
          connection.plugin(MongooseDelete, { deletedAt: true })
          return connection
        }
      })
    })
  ]
})
export class MongoDbProvider {
  onModuleInit() {
    logger.info('connected to mongodb')
  }
}
