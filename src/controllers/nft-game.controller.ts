import { Controller, Post, Body, Get, Param, Query, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger'
import { AccountId, AssetType } from 'caip'
import { ethers } from 'ethers'

import {
  HASH_ZERO,
  MAX_WAIT_FOR_SIGNED_AGREEMENT,
  SBT_COUNTER_INCREMENT_HASH
} from '@common/constants/signature'
import { Auth } from '@common/decorators/auth.decorators'
import { Role } from '@common/enums/role.enum'
import { UserService } from '@services/user.service'
import { EvmService } from '@services/utils/evm.service'
import { VenlyService } from '@services/utils/venly.service'
import { PinService } from '@services/utils/venly/pin.service'

import {
  MintWalletBodyDto,
  NFTTransferBodyDto,
  NFTWalletBodyDto,
  PayableNFTWalletBodyDto
} from '../common/dto/venly.dto'

@ApiTags('Game Control')
@Controller()
export class NftGameController {
  constructor(
    private readonly userService: UserService,
    private readonly venlyService: VenlyService,
    private readonly evmService: EvmService,
    private readonly config: ConfigService,
    private readonly pinService: PinService
  ) {}

  @Auth(Role.NFT_ADMIN)
  @Post('mint')
  @ApiOperation({
    description: 'Mints an Nft and returns the transaction hash'
  })
  @ApiOkResponse({
    type: String
  })
  @ApiExcludeEndpoint()
  @ApiCreatedResponse()
  @ApiBody({ type: MintWalletBodyDto })
  async mint(@Body() { uuid, assetType }: MintWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    const walletId = user.wallet.id
    const walletAddress = user.wallet.address
    const pincode = await this.pinService.getPin(uuid)
    await this.venlyService.topUp(walletId, walletAddress)
    return this.venlyService.mint({
      walletId,
      walletAddress,
      pincode,
      assetType: new AssetType(assetType)
    })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('unbox')
  @ApiOperation({
    description: 'Unboxes an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTWalletBodyDto })
  async unbox(@Body() { assetId, uuid }: NFTWalletBodyDto) {
    if (uuid) {
      const user = await this.userService.findByUUID(uuid)
      if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

      const to = this.config.get('contracts.unboxAddress') as string
      const walletId = user.wallet.id
      const walletAddress = user.wallet.address
      const pincode = await this.pinService.getPin(uuid)

      await this.venlyService.topUp(walletId, walletAddress)

      await this.venlyService.approveNft(
        walletId,
        pincode,
        assetId.assetName.reference,
        assetId.tokenId,
        to
      )
    }

    const operatorUUID = this.config.get('operator.uuid')
    const operator = await this.userService.findByUUID(operatorUUID)
    if (!operator) throw new NotFoundException(`Can't find user with uuid: ${operatorUUID}`)
    const operatorPincode = await this.pinService.getPin(operatorUUID)
    const operatorWalletId = operator.wallet.id

    return this.venlyService.unbox({ assetId, operatorWalletId, operatorPincode })
  }

  @Auth(Role.NFT_ADMIN)
  @Post('upgrade')
  @ApiOperation({
    description: 'Upgrades an Nft and returns the transaction hash'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: PayableNFTWalletBodyDto })
  async upgrade(@Body() { uuid, assetId, value }: PayableNFTWalletBodyDto) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    const { id: walletId, address: walletAddress } = user.wallet
    const pincode = this.pinService.getPin(uuid)
    await this.venlyService.topUp(walletId, walletAddress)

    return this.venlyService.upgrade({ walletId, assetId, value, pincode })
  }

  @Auth(Role.USER_ADMIN, Role.OWNER)
  @Get('user/:uuid/nft')
  @ApiOperation({ description: 'Returns user nfts' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserNfts(@Param('uuid') uuid: string, @Query() { nfts }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletAddress = user.wallet?.address
    if (walletAddress) {
      const accountId = new AccountId({
        address: walletAddress,
        chainId: {
          namespace: 'eip155',
          reference: this.config.get('stage') === 'production' ? '56' : '97'
        }
      })
      return await this.evmService.getAccountNfts(accountId, nfts)
    } else return []
  }

  @Auth(Role.USER_ADMIN)
  @Get('user/:uuid/balance')
  @ApiOperation({ description: 'Returns user token balance' })
  @ApiParam({ name: 'uuid', type: String })
  async getUserBalance(@Param('uuid') uuid: string, @Query() { token }) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)
    const walletId = user.wallet?.id
    if (walletId) {
      return this.venlyService.getTokenBalance({ walletId, token })
    }
    return null
  }

  @Auth(Role.NFT_ADMIN, Role.OWNER)
  @Post('user/:uuid/nft/transfer')
  @ApiOperation({
    description: 'transfer NFTs to other wallet'
  })
  @ApiOkResponse({ type: String })
  @ApiBody({ type: NFTTransferBodyDto })
  @ApiParam({ name: 'uuid', type: String })
  async transfer(@Body() { assetIds, to }: NFTTransferBodyDto, @Param('uuid') uuid: string) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    const { id: walletId, address: venlyAddress } = user.wallet
    const pincode = await this.pinService.getPin(uuid)
    await this.venlyService.topUp(walletId, venlyAddress)

    return this.venlyService.transfer(venlyAddress, to, assetIds, pincode, walletId)
  }

  @Auth(Role.OWNER)
  @Get('user/:uuid/matches')
  @ApiOperation({
    description: 'Returns user match rank metadata'
  })
  @ApiOkResponse({ type: String })
  @ApiParam({ name: 'uuid', type: String })
  async getMatches(@Param('uuid') uuid: string) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    return this.venlyService.getUserMatchesMetadata(user.wallet.address)
  }

  @Auth(Role.NFT_ADMIN)
  @Post('user/:uuid/matches')
  @ApiOperation({
    description: 'increment user match rank in the SBT contract'
  })
  @ApiOkResponse({ type: String })
  @ApiParam({ name: 'uuid', type: String })
  async incrementMatches(@Param('uuid') uuid: string) {
    const user = await this.userService.findByUUID(uuid)
    if (!user) throw new NotFoundException(`Can't find user with uuid: ${uuid}`)

    const pincode = await this.pinService.getPin(uuid)
    const { id: walletId, address: spender } = user.wallet
    const contractAddress = this.config.get('contracts.sbtMatchesAddress') as string
    const deadline = Math.round((new Date().getTime() + MAX_WAIT_FOR_SIGNED_AGREEMENT) / 1000)

    const operatorUUID = this.config.get('operator.uuid')
    const operator = await this.userService.findByUUID(operatorUUID)
    if (!operator) throw new NotFoundException(`Can't find user with uuid: ${operatorUUID}`)
    const operatorPincode = await this.pinService.getPin(operatorUUID)
    const operatorWalletId = operator.wallet.id

    const signature = await this.venlyService.signOperatorPermit({
      operatorPincode,
      operatorWalletId,
      contractAddress,
      spender,
      allowedFunction: SBT_COUNTER_INCREMENT_HASH,
      allowedParameters: HASH_ZERO,
      deadline
    })

    const data = ethers.utils.defaultAbiCoder.encode(['uint256', 'bytes'], [deadline, signature])

    return this.venlyService.incrementMatches(pincode, walletId, data)
  }
}
