import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AssetType } from 'caip'
import { ethers } from 'ethers'
import { connect, Connection, Model } from 'mongoose'
import supertest from 'supertest'

import { NftUnboxingDto, NftUnboxingSchema } from '@common/schemas/nft-unboxing.schema'
import { UserDto, UserSchema } from '@common/schemas/user.schema'
import { AppModule } from '@modules/app.module'
import { unboxUser } from '__mocks__/dbUsers'
import { nftLegendaryBox } from '__mocks__/nftUnboxingMock'

import type { AssetIdDto } from '@common/types/caip'

describe('Nft Game controller (e2e)', () => {
  let mongoConnection: Connection, app: INestApplication
  jest.setTimeout(500000)

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_CICD_URI
    mongoConnection = (await connect(mongoUri)).connection

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await mongoConnection.close()
    await app.close()
  })

  describe('unbox with Venly', () => {
    let assetId: AssetIdDto,
      provider: ethers.providers.JsonRpcProvider,
      NftUnboxingModel: Model<NftUnboxingDto>,
      UserModel: Model<UserDto>
    const testUserPin = process.env.TEST_VENLY_PIN

    beforeAll(async () => {
      NftUnboxingModel = mongoConnection.model(NftUnboxingDto.name, NftUnboxingSchema)
      const testNftUnboxing = new NftUnboxingModel(nftLegendaryBox)
      await testNftUnboxing.save()

      UserModel = mongoConnection.model(UserDto.name, UserSchema)
      const testUser = new UserModel(unboxUser)
      const newUser = await testUser.save()
      console.log({ newUser })

      provider = new ethers.providers.JsonRpcProvider(
        'https://data-seed-prebsc-1-s1.binance.org:8545/',
        97
      )
      const minterPrivateKey = process.env.TEST_MINTER_WALLET_PRIVATE_KEY
      const signer = new ethers.Wallet(minterPrivateKey, provider)

      const abi = [
        'function mint(address to) external returns (uint256 tokenId)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
      ]

      const boxInterface = new ethers.utils.Interface(abi)

      const NFTBox = new ethers.Contract(nftLegendaryBox.assetType.assetName.reference, abi, signer)

      const tx = await NFTBox.mint(unboxUser.wallet.address)
      const receipt = await tx.wait()
      const logs = receipt.events.map(({ data, topics }) => boxInterface.parseLog({ data, topics }))
      const tokenId = logs.find(({ name }) => name === 'Transfer').args.tokenId.toString()
      assetId = {
        tokenId,
        chainId: nftLegendaryBox.assetType.chainId,
        assetName: nftLegendaryBox.assetType.assetName
      }
    }, 500000)

    afterAll(async () => {
      await NftUnboxingModel.deleteMany({})
      await UserModel.deleteMany({})
    })

    it('throw if the uuid is invalid', () => {
      const uuid = 'badUUID'
      return supertest(app.getHttpServer())
        .post('/game/unbox')
        .send({
          assetId,
          uuid,
          pincode: 'test'
        })
        .expect(404)
        .expect({
          statusCode: 404,
          message: `Can't find user with uuid: ${uuid}`,
          error: 'Not Found'
        })
    })

    it('throw if the assetId is invalid', () => {
      const badAssetId = { ...assetId, assetName: { namespace: 'bad', reference: 'bad' } }
      return supertest(app.getHttpServer())
        .post('/game/unbox')
        .send({
          assetId: badAssetId,
          uuid: unboxUser.uuid,
          pincode: testUserPin
        })
        .expect(500)
    })
    it('return a valid transaction hash on success', async () => {
      return supertest(app.getHttpServer())
        .post('/game/unbox')
        .send({ assetId, uuid: unboxUser.uuid, pincode: testUserPin })
        .expect(201)
        .then(async (res) => {
          const txHash = res.text
          const tx = await provider.getTransaction(txHash)
          const receipt = await tx.wait()

          const abi = [
            'event Unboxed(uint256 indexed tokenId, address[] nfts, uint256[][] mintedTokenIds)',
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
            'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)'
          ]
          const unboxInterface = new ethers.utils.Interface(abi)
          const logs = receipt.logs.map(({ data, topics }) =>
            unboxInterface.parseLog({ data, topics })
          )
          const unboxedEvent = logs.find(({ name }) => name === 'Unboxed')
          const args = unboxedEvent.args

          expect(args[0].toString()).toEqual(assetId.tokenId)
          expect(args[1]).toEqual(nftLegendaryBox.nfts)
          expect(args[2]).toHaveLength(1)
          expect(args[2][0]).toHaveLength(2)
        })
    })
  })
  describe('unbox with Metamask', () => {
    let assetId: AssetIdDto,
      provider: ethers.providers.JsonRpcProvider,
      NftUnboxingModel: Model<NftUnboxingDto>

    beforeAll(async () => {
      NftUnboxingModel = mongoConnection.model(NftUnboxingDto.name, NftUnboxingSchema)
      const testNftUnboxing = new NftUnboxingModel(nftLegendaryBox)
      await testNftUnboxing.save()

      provider = new ethers.providers.JsonRpcProvider(
        'https://data-seed-prebsc-1-s1.binance.org:8545/',
        97
      )
      const minterPrivateKey = process.env.TEST_MINTER_WALLET_PRIVATE_KEY
      const minterSigner = new ethers.Wallet(minterPrivateKey, provider)

      const ownerPrivateKey = process.env.TEST_METAMASK_PRIVATE_KEY
      const ownerSigner = new ethers.Wallet(ownerPrivateKey, provider)

      const abi = [
        'function mint(address to) external returns (uint256 tokenId)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        'function approve(address to, uint256 tokenId) external'
      ]

      const boxInterface = new ethers.utils.Interface(abi)

      const NFTBox = new ethers.Contract(
        nftLegendaryBox.assetType.assetName.reference,
        abi,
        minterSigner
      )

      const tx = await NFTBox.mint(ownerSigner.address)
      const receipt = await tx.wait()
      const logs = receipt.events.map(({ data, topics }) => boxInterface.parseLog({ data, topics }))
      const tokenId = logs.find(({ name }) => name === 'Transfer').args.tokenId.toString()
      assetId = {
        tokenId,
        chainId: nftLegendaryBox.assetType.chainId,
        assetName: nftLegendaryBox.assetType.assetName
      }

      const unboxAddress = process.env.UNBOX_ADDRESS
      const approveTx = await NFTBox.connect(ownerSigner).approve(unboxAddress, tokenId)
      await approveTx.wait()
    }, 500000)

    afterAll(async () => {
      await NftUnboxingModel.deleteMany({})
    })

    it('throw if the assetId is invalid', () => {
      const badAssetId = { ...assetId, assetName: { namespace: 'bad', reference: 'bad' } }
      return supertest(app.getHttpServer())
        .post('/game/unbox')
        .send({
          assetId: badAssetId
        })
        .expect(404)
        .expect({
          statusCode: 404,
          message: `asset can't be unboxed: ${new AssetType({
            assetName: badAssetId.assetName,
            chainId: badAssetId.chainId
          })}`,
          error: 'Not Found'
        })
    })
    it('return a valid transaction hash on success', async () => {
      return supertest(app.getHttpServer())
        .post('/game/unbox')
        .send({ assetId })
        .expect(201)
        .then(async (res) => {
          const txHash = res.text
          const tx = await provider.getTransaction(txHash)
          const receipt = await tx.wait()

          const abi = [
            'event Unboxed(uint256 indexed tokenId, address[] nfts, uint256[][] mintedTokenIds)',
            'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
            'event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)'
          ]
          const unboxInterface = new ethers.utils.Interface(abi)
          const logs = receipt.logs.map(({ data, topics }) =>
            unboxInterface.parseLog({ data, topics })
          )
          const unboxedEvent = logs.find(({ name }) => name === 'Unboxed')
          const args = unboxedEvent.args

          expect(args[0].toString()).toEqual(assetId.tokenId)
          expect(args[1]).toEqual(nftLegendaryBox.nfts)
          expect(args[2]).toHaveLength(1)
          expect(args[2][0]).toHaveLength(2)
        })
    })
  })
})
