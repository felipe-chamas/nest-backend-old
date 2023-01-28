import { getRedisToken } from '@liaoliaots/nestjs-redis'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { VenlyService } from '@services/utils/venly.service'
import { PinService } from '@services/utils/venly/pin.service'
import { mockConfigService } from '__mocks__/config.mock'
import { mockRedis } from '__mocks__/redis.mock'
import { mockVenlyService } from '__mocks__/venly.mock'

describe('pinService', function () {
  let service: PinService
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinService,
        {
          provide: getRedisToken('default'),
          useValue: mockRedis
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        },
        {
          provide: VenlyService,
          useValue: mockVenlyService
        }
      ]
    }).compile()

    service = module.get<PinService>(PinService)
  })
  describe('newPin', function () {
    const uuid = 'test-uuid'
    beforeEach(async () => {
      await mockRedis.set(uuid, null)
    })
    it('new salt must be saved on redis.io', async function () {
      await service.newPin(uuid)
      const salt = await mockRedis.get(uuid)
      expect(typeof salt).toEqual('string')
      expect(salt.length).toBeGreaterThan(20)
    })
    it('new pin must have a length of 6 digits', async function () {
      const pin = await service.newPin(uuid)
      expect(pin.length).toEqual(6)
    })
    it('all the pin digits must be numbers', async function () {
      const pin = await service.newPin(uuid)
      expect(/^[0-9]*$/.test(pin)).toEqual(true)
    })
    it('two different users must have different pins', async function () {
      const pin1 = await service.newPin(uuid)
      const pin2 = await service.newPin(uuid + 2)

      expect(pin1 === pin2).toEqual(false)
    })
    it('if user already have a salt throw', async () => {
      await service.newPin(uuid)
      expect.assertions(2)
      try {
        await service.newPin(uuid)
      } catch (error) {
        expect(error.status).toEqual(400)
        expect(error.response.message).toEqual('user test-uuid already have a salt')
      }
    })
  })
  describe('getPin', function () {
    const uuid = 'user-uuid'
    const updatePin = mockVenlyService.updatePin as jest.Mock

    beforeEach(async () => {
      await mockRedis.set(uuid, null)
      updatePin.mockClear()
    })
    it("if salt wasn't updated return the last pin", async function () {
      const firstPin = await service.newPin(uuid)
      const lastPin = await service.getPin(uuid)
      expect(lastPin).toEqual(firstPin)
    })
    it('if salt was updated generate a new pin', async function () {
      const firstPin = await service.newPin(uuid)

      await mockRedis.set(uuid, 'new-salt')
      const lastPin = service.getPin(uuid)

      expect(lastPin).not.toEqual(firstPin)
    })
  })
})
