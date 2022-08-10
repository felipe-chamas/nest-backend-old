import { Module } from '@nestjs/common';
import { DiscordController } from './discord.controller';
import { DiscordService } from './discord.service';
import { UserModule } from '../../../models';
import { UserService } from '../../../models/user';
import { DiscordStrategy } from './DiscordStrategy';

@Module({
  controllers: [DiscordController],
  imports: [UserModule],
  providers: [DiscordStrategy, DiscordService, UserService],
})
export class DiscordAuthModule {}
