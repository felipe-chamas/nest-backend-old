import { Module } from '@nestjs/common';
import { SteamController } from './steam.controller';
import { SteamService } from './steam.service';
import { UserModule } from '../../../models';
import { UserService } from '../../../models/user';
import { SteamStrategy } from './SteamStrategy';

@Module({
  controllers: [SteamController],
  imports: [UserModule],
  providers: [SteamStrategy, SteamService, UserService],
})
export class SteamAuthModule {}
