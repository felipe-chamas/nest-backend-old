import { Test, TestingModule } from '@nestjs/testing'

import { AppController } from '@controllers/app.controller'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController]
    }).compile()
  })

  describe('getData', () => {
    it('should return "Welcome to backend!"', () => {
      const appController = app.get<AppController>(AppController)
      expect(appController.getData()).toEqual({
        message: 'Welcome!'
      })
    })
  })
})
