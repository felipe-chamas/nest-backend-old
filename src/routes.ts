import { Routes } from 'nest-router'

import { AuthModule } from '@modules/auth.module'
import { DiscordAuthModule } from '@modules/auth/discord.module'
import { EpicAuthModule } from '@modules/auth/epic.module'
import { FractalAuthModule } from '@modules/auth/fractal.module'
import { SignatureAuthModule } from '@modules/auth/signature.module'
import { SteamAuthModule } from '@modules/auth/steam.module'
import { NftCollectionModule } from '@modules/nft-collection.module'
import { NftGameModule } from '@modules/nft-game.module'
import { NftModule } from '@modules/nft.module'
import { UserModule } from '@modules/user.module'

export const routes: Routes = [
  {
    path: 'nft',
    module: NftModule,
    children: [
      {
        path: 'collection',
        module: NftCollectionModule
      }
    ]
  },
  {
    path: 'game',
    module: NftGameModule
  },
  {
    path: 'user',
    module: UserModule
  },
  {
    path: 'auth',
    module: AuthModule,
    children: [
      {
        path: 'discord',
        module: DiscordAuthModule
      },
      {
        path: 'steam',
        module: SteamAuthModule
      },
      {
        path: 'epic',
        module: EpicAuthModule
      },
      {
        path: 'fractal',
        module: FractalAuthModule
      },
      {
        path: 'signature',
        module: SignatureAuthModule
      }
    ]
  }
]
