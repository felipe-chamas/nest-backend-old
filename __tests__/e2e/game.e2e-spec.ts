import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import Ajv from 'ajv'
import { AssetType } from 'caip'
import { ethers } from 'ethers'
import { connect, Connection, Model } from 'mongoose'
import supertest from 'supertest'

import { NftUnboxingDto, NftUnboxingSchema } from '@common/schemas/nft-unboxing.schema'
import { UserDto, UserSchema } from '@common/schemas/user.schema'
import { AppModule } from '@modules/app.module'
import { unboxUser, walletUser } from '__mocks__/dbUsers'
import { nftLegendaryBox } from '__mocks__/nftUnboxingMock'
import { transferUser1, transferUser2 } from '__mocks__/trasnsferUsers'

import type { AssetIdDto } from '@common/types/caip'

describe('Nft Game controller (e2e)', () => {
  let mongoConnection: Connection, app: INestApplication
  jest.setTimeout(500000)

  const BscRpcUrl = 'https://data-seed-prebsc-2-s3.binance.org:8545'

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
    const collections = await mongoConnection.db.collections()
    const deleteCollectionsPromise = Promise.all(
      collections.map((collection) => collection.deleteMany({}))
    )
    await deleteCollectionsPromise

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
      await testUser.save()

      provider = new ethers.providers.JsonRpcProvider(BscRpcUrl, 97)
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

      provider = new ethers.providers.JsonRpcProvider(BscRpcUrl, 97)
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

  describe('transfer', () => {
    let UserModel: Model<UserDto>,
      provider: ethers.providers.JsonRpcProvider,
      badgeAssetIds: AssetIdDto[],
      NftBadge: ethers.Contract,
      BoxAssetId: AssetIdDto,
      NFTBox: ethers.Contract
    const pincode = process.env.TEST_VENLY_PIN
    beforeAll(async () => {
      UserModel = mongoConnection.model(UserDto.name, UserSchema)
      const testUser1 = new UserModel(transferUser1)
      await testUser1.save()

      const testUser2 = new UserModel(transferUser2)
      await testUser2.save()

      provider = new ethers.providers.JsonRpcProvider(BscRpcUrl, 97)
      const minterPrivateKey = process.env.TEST_MINTER_WALLET_PRIVATE_KEY
      const signer = new ethers.Wallet(minterPrivateKey, provider)

      const abi = [
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        'function batchMint(address[] calldata accounts, uint256 tokens) external',
        'function ownerOf(uint256 _tokenId) external view returns (address)'
      ]

      const badgeInterface = new ethers.utils.Interface(abi)

      NftBadge = new ethers.Contract('0x70d09Dc7Bc72B50B4D200b36f59B12016396F5E0', abi, signer)

      const tx = await NftBadge.batchMint([transferUser1.wallet.address], 4)
      const receipt = await tx.wait()
      const logs = receipt.events.map(({ data, topics }) =>
        badgeInterface.parseLog({ data, topics })
      )
      const transfersEvents = logs.filter(({ name }) => name === 'Transfer')
      badgeAssetIds = transfersEvents.map((event) => {
        return {
          tokenId: event.args.tokenId.toString(),
          chainId: {
            namespace: 'eip155',
            reference: '97'
          },
          assetName: {
            namespace: 'erc721',
            reference: NftBadge.address
          }
        }
      })

      const boxAbi = [
        'function mint(address to) external returns (uint256 tokenId)',
        'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
        'function ownerOf(uint256 _tokenId) external view returns (address)'
      ]

      const boxInterface = new ethers.utils.Interface(abi)

      NFTBox = new ethers.Contract(nftLegendaryBox.assetType.assetName.reference, boxAbi, signer)

      const boxMintTx = await NFTBox.mint(unboxUser.wallet.address)
      const boxMintReceipt = await boxMintTx.wait()
      const boxMintLogs = boxMintReceipt.events.map(({ data, topics }) =>
        boxInterface.parseLog({ data, topics })
      )
      const tokenId = boxMintLogs.find(({ name }) => name === 'Transfer').args.tokenId.toString()
      BoxAssetId = {
        tokenId,
        chainId: nftLegendaryBox.assetType.chainId,
        assetName: nftLegendaryBox.assetType.assetName
      }
    }, 500000)
    afterAll(async () => {
      UserModel.deleteMany({})
    })
    it('if user is not in the db throw a not found exeption', async () => {
      const uuid = 'badUUID'
      return supertest(app.getHttpServer())
        .post(`/game/user/${uuid}/nft/transfer`)
        .send({
          assetIds: badgeAssetIds,
          to: transferUser2.wallet.address,
          pincode
        })
        .expect(404)
        .expect({
          statusCode: 404,
          message: `Can't find user with uuid: ${uuid}`,
          error: 'Not Found'
        })
    })
    it('transfer one NFT to an other Venly wallet successfully', async () => {
      const nft = badgeAssetIds[0]
      return supertest(app.getHttpServer())
        .post(`/game/user/${transferUser1.uuid}/nft/transfer`)
        .send({
          assetIds: [nft],
          to: transferUser2.wallet.address,
          pincode
        })
        .expect(201)
        .then(async (res) => {
          const body = res.body
          expect(body).toHaveLength(1)
          const tx = await provider.getTransaction(body[0])
          await tx.wait()
          const NftOwner = await NftBadge.ownerOf(nft.tokenId)
          expect(NftOwner).toEqual(transferUser2.wallet.address)
        })
    })
    it('transfer two NFTs to an other Venly wallet successfully', async () => {
      const nfts = [badgeAssetIds[1], badgeAssetIds[2]]
      return supertest(app.getHttpServer())
        .post(`/game/user/${transferUser1.uuid}/nft/transfer`)
        .send({
          assetIds: nfts,
          to: transferUser2.wallet.address,
          pincode
        })
        .expect(201)
        .then(async (res) => {
          const body = res.body
          expect(body).toHaveLength(1)

          const tx = await provider.getTransaction(body[0])
          await tx.wait()

          const nftsOwners = await Promise.all(nfts.map((nft) => NftBadge.ownerOf(nft.tokenId)))

          nftsOwners.forEach((owner) => {
            expect(owner).toEqual(transferUser2.wallet.address)
          })
        })
    })

    it('transfer two NFTs from two different contracts to an other Venly wallet successfully', async () => {
      const nfts: AssetIdDto[] = [badgeAssetIds[3], BoxAssetId]
      return supertest(app.getHttpServer())
        .post(`/game/user/${transferUser1.uuid}/nft/transfer`)
        .send({
          assetIds: nfts,
          to: transferUser2.wallet.address,
          pincode
        })
        .expect(201)
        .then(async (res) => {
          const body = res.body
          expect(body).toHaveLength(2)

          const transactions = await Promise.all(
            body.map((hash: string) => provider.getTransaction(hash))
          )
          await Promise.all(transactions.map((tx) => tx.wait()))

          const nftsOwners = await Promise.all(
            nfts.map((nft) => {
              if (NftBadge.address === nft.assetName.reference) {
                return NftBadge.ownerOf(nft.tokenId)
              }
              return NFTBox.ownerOf(nft.tokenId)
            })
          )

          nftsOwners.forEach((owner) => {
            expect(owner).toEqual(transferUser2.wallet.address)
          })
        })
    })
  })

  describe('get user nfts', () => {
    let UserModel: Model<UserDto>
    beforeAll(async () => {
      UserModel = mongoConnection.model(UserDto.name, UserSchema)
      const userWithWallet = new UserModel(unboxUser)
      await userWithWallet.save()
      const noWalletUser = new UserModel(walletUser)
      await noWalletUser.save()
    })
    afterAll(async () => {
      UserModel.deleteMany({})
    })
    it('if user is not in the db throw a not found exeption', async () => {
      const uuid = 'badUUID'
      return supertest(app.getHttpServer())
        .get(`/game/user/${uuid}/nft`)
        .expect(404)
        .expect({
          statusCode: 404,
          message: `Can't find user with uuid: ${uuid}`,
          error: 'Not Found'
        })
    })
    it('if user is not have a venly wallet return empty array', async () => {
      return supertest(app.getHttpServer())
        .get(`/game/user/${walletUser.uuid}/nft`)
        .expect(200)
        .then((res) => {
          const { body } = res
          expect(body).toHaveLength(0)
        })
    })
    it('return nfts successfully', async () => {
      return supertest(app.getHttpServer())
        .get(`/game/user/${unboxUser.uuid}/nft`)
        .expect(200)
        .then((res) => {
          const { body } = res
          const ajv = new Ajv()

          const stringSchema = {
            type: 'string',
            minLength: 2
          }

          const numericSchema = { type: 'string', pattern: '[0-9]+' }

          const chainIdSchema = {
            type: 'object',
            properties: {
              namespace: { type: 'string', pattern: 'eip155' },
              reference: numericSchema
            },
            required: ['namespace', 'reference'],
            additionalProperties: false
          }

          const assetNameSchema = {
            type: 'object',
            properties: {
              namespace: { type: 'string', pattern: 'erc721' },
              reference: { type: 'string', pattern: '0x.+' }
            },
            required: ['namespace', 'reference'],
            additionalProperties: false
          }

          const assetIdSchema = {
            type: 'object',
            properties: {
              chainId: chainIdSchema,
              assetName: assetNameSchema,
              tokenId: numericSchema
            },
            required: ['chainId', 'assetName', 'tokenId'],
            additionalProperties: false
          }

          const uriSchema = {
            type: 'string',
            pattern: '^https://.+'
          }

          const attributesSchema = {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                trait_type: stringSchema,
                value: numericSchema
              },
              required: ['trait_type', 'value']
            }
          }

          const metadataSchema = {
            type: 'object',
            properties: {
              name: stringSchema,
              description: stringSchema,
              image: uriSchema,
              external_url: uriSchema,
              symbol: stringSchema,
              attributes: attributesSchema
            },
            required: ['name', 'description', 'image', 'symbol', 'attributes']
          }

          const schema = {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                assetId: assetIdSchema,
                tokenUri: uriSchema,
                metadata: metadataSchema
              },
              required: ['assetId', 'tokenUri', 'metadata'],
              additionalProperties: false
            }
          }

          const validate = ajv.compile(schema)
          const valid = validate(body)

          if (!valid) {
            const errors = validate.errors
            const indexes = errors.map((error) => Number(error.instancePath.split('/')[1]))
            const displayErrors = indexes.map((index, i) => ({
              validationError: errors[i],
              failItem: body[index]
            }))

            console.log(JSON.stringify(displayErrors, null, 2))
          }

          expect(valid).toBe(true)
        })
    })
  })
})
