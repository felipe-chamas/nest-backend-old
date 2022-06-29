import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { UserModule } from '../../../models';
import { UserService } from '../../../models/user';
import { DiscordStrategy } from './DiscordStrategy';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [DiscordController],
  imports: [ConfigService, UserModule],
  providers: [DiscordStrategy, DiscordService, UserService],
})
export class DiscordModule {}
