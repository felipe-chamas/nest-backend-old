import { getRedisToken } from '@liaoliaots/nestjs-redis'
import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Redis } from 'ioredis'
import { connect, Connection, Model } from 'mongoose'
import supertest from 'supertest'

import { UserDto, UserSchema } from '@common/schemas/user.schema'
import { AppModule } from '@modules/app.module'
import { VenlyService } from '@services/utils/venly.service'
import { walletUser, testSteamId, steamNoImageUser } from '__mocks__/dbUsers'

describe('userController (e2e)', () => {
  let app: INestApplication,
    mongoConnection: Connection,
    UserModel: Model<UserDto>,
    venlyService: VenlyService,
    redis: Redis
  const createdWalletsIds: string[] = []
  jest.setTimeout(90000)

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_CICD_URI
    mongoConnection = (await connect(mongoUri)).connection
    UserModel = mongoConnection.model(UserDto.name, UserSchema)

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
    redis = app.get<Redis>(getRedisToken('default'))
    venlyService = app.get<VenlyService>(VenlyService)
  })
  afterAll(async () => {
    await Promise.all(createdWalletsIds.map((id) => venlyService.archiveWallet(id)))
    await mongoConnection.close()
    await redis.del(walletUser.uuid)
    await app.close()
  })

  describe('POST /user/wallet', () => {
    beforeAll(async () => {
      const TestUser = new UserModel(walletUser)
      await TestUser.save()
    })
    afterAll(async () => {
      await UserModel.deleteMany({})
    })
    it('if user not exist send an 404 error', () => {
      return supertest(app.getHttpServer())
        .post('/user/wallet')
        .send({
          uuid: 'badUUID'
        })
        .expect(404)
        .expect({
          statusCode: 404,
          message: "Can't find user with uuid: badUUID",
          error: 'Not Found'
        })
    })

    it('create wallet successfully', () => {
      return supertest(app.getHttpServer())
        .post('/user/wallet')
        .send({
          uuid: walletUser.uuid
        })
        .expect(201)
        .then((res) => {
          const { body } = res
          expect(body.uuid).toEqual(walletUser.uuid)
          expect(body.wallet).toBeDefined()
          expect(body.wallet.id).toBeDefined()
          expect(body.wallet.address).toBeDefined()
          expect(body.wallet.walletType).toEqual('WHITE_LABEL')
          expect(body.wallet.secretType).toEqual('BSC')
          expect(body.wallet.identifier).toEqual(walletUser.uuid)
          createdWalletsIds.push(body.wallet.id)
        })
    })
    it('user in db must be updated', async () => {
      const user = await UserModel.findOne({ uuid: 'testUser' })
      expect(user.wallet.identifier).toEqual(walletUser.uuid)
    })
  })
  describe('GET /user/steam/:steamId', () => {
    afterAll(async () => {
      await UserModel.deleteMany({})
    })

    it('if steamId not exist return an error', () => {
      return supertest(app.getHttpServer()).get(`/user/steam/badId`).expect(400)
    })

    it('if the user steamId is not in the db, create a new user and seve it in the db', async () => {
      await supertest(app.getHttpServer())
        .get(`/user/steam/${testSteamId}`)
        .then((res) => {
          const { body } = res
          expect(res.status).toEqual(200)
          expect(body.name).toEqual('nicolasdeheza')
          expect(body.socialAccounts.steam.id).toEqual(testSteamId)
          expect(body.socialAccounts.steam.username).toEqual('nicolasdeheza')
          expect(body.imageUrl).toBeDefined()
        })
      const user = await UserModel.findOne({ 'socialAccounts.steam.id': testSteamId })
      expect(user.uuid).toBeDefined()
    })

    it('if user exist and have image return it', async () => {
      let user = await UserModel.findOne({ 'socialAccounts.steam.id': testSteamId })
      if (!user) {
        const NewUser = new UserModel({ ...steamNoImageUser, imageUrl: 'https://test-image.com' })
        user = await NewUser.save()
      }
      const jsonUser = JSON.stringify(user)
      return supertest(app.getHttpServer())
        .get(`/user/steam/${user.socialAccounts.steam.id}`)
        .expect(200)
        .then((res) => {
          const { body } = res
          expect(body).toMatchObject(JSON.parse(jsonUser))
        })
    })
    it('if user exist but not have image add it', async () => {
      await UserModel.deleteOne({ 'socialAccounts.steam.id': testSteamId })
      const user = await UserModel.create(steamNoImageUser)

      await supertest(app.getHttpServer())
        .get(`/user/steam/${user.socialAccounts.steam.id}`)
        .then((res) => {
          const { body } = res
          expect(res.status).toEqual(200)
          expect(body.imageUrl).toBeDefined()
        })
      const updateUser = await UserModel.findOne({ 'socialAccounts.steam.id': testSteamId })
      expect(updateUser.imageUrl).toBeDefined()
    })
  })
})
