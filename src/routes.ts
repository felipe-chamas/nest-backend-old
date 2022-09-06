import { Routes } from 'nest-router'

import { AuthModule } from '@modules/auth.module'
import { DiscordAuthModule } from '@modules/auth/discord.module'
import { FractalAuthModule } from '@modules/auth/fractal.module'
import { SignatureAuthModule } from '@modules/auth/signature.module'
import { SteamAuthModule } from '@modules/auth/steam.module'
import { NftCollectionModule } from '@modules/nft-collection.module'
import { NftModule } from '@modules/nft.module'
import { UserModule } from '@modules/user.module'
import { WalletModule } from '@modules/wallet.module'

export const routes: Routes = [
  {
    path: 'nft',
    module: NftModule,
    children: [
      {
        path: 'wallet',
        module: WalletModule
      }
    ]
  },
  {
    path: 'user',
    module: UserModule
  },
  {
    path: 'nft-collection',
    module: NftCollectionModule
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
