import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import supertest from 'supertest'

import { AppController } from '@controllers/app.controller'

describe('AppController (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController]
    }).compile()
    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('/ (GET)', () => {
    return supertest(app.getHttpServer()).get('/').expect(200).expect({ message: 'Welcome!' })
  })
})
