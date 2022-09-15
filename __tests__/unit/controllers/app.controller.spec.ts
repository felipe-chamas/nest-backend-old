import { Test } from '@nestjs/testing'

import { AppController } from '@controllers/app.controller'

describe('AppController', () => {
  let controller: AppController

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController]
    }).compile()

    controller = module.get<AppController>(AppController)
  })

  it('should return "Welcome!"', () => {
    expect(controller.getData()).toEqual({
      message: 'Welcome!'
    })
  })
})
