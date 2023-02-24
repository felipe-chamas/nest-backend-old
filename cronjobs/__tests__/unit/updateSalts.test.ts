import { Redis } from 'ioredis'

import * as RedisClient from '../../src/updateSalts/redis'
import * as UpdatePin from '../../src/updateSalts/venly'
// eslint-disable-next-line import/order
import { user } from '../mocks/users'

jest.mock('../../src/updateSalts/venly')
const mockedUpdatePin = jest.spyOn(UpdatePin, 'updatePin')

const mockedGetRedisClient = jest.spyOn(RedisClient, 'getRedisClient')
const mockRedisGet = jest.fn()
const mockRedisSet = jest.fn()

jest.mock('mongoose')
const mockedUserFind = jest.fn()
jest.mock('../../src/updateSalts/models/User', () => ({
  find: mockedUserFind
}))

// eslint-disable-next-line import/order
import updateSaltsAndPins from '../../src/updateSalts'

describe('updateSalts', () => {
  describe('updateSaltsAndPins', () => {
    beforeEach(() => {
      mockedGetRedisClient.mockImplementation(
        async () =>
          ({
            get: mockRedisGet,
            set: mockRedisSet,
            quit: jest.fn()
          } as unknown as Redis)
      )
    })
    afterEach(() => {
      jest.clearAllMocks()
    })
    it('call updateUserPinAndSalt for all the users', async () => {
      const userArr = [user, user]
      mockedUserFind.mockResolvedValueOnce(userArr)
      mockRedisGet.mockResolvedValue('slat')
      await updateSaltsAndPins()
      expect(mockedUpdatePin).toBeCalledTimes(userArr.length)
    })
    it('if redis fails restore updatePin', async () => {
      const userArr = [user]
      mockedUserFind.mockResolvedValueOnce(userArr)
      mockRedisGet.mockResolvedValue('salt')
      mockRedisSet.mockRejectedValue('error')

      await updateSaltsAndPins()
      expect(mockedUpdatePin.mock.calls[1][1]).toEqual(mockedUpdatePin.mock.calls[0][0])
      expect(mockedUpdatePin.mock.calls[1][0]).toEqual(mockedUpdatePin.mock.calls[0][1])
    })
    it('if one update fails continue with the next', async () => {
      const userArr = [user, user]
      mockedUserFind.mockResolvedValueOnce(userArr)
      mockRedisGet.mockResolvedValue('slat')
      mockedUpdatePin.mockRejectedValueOnce('error')

      await updateSaltsAndPins()
      expect(mockRedisSet).toBeCalledTimes(userArr.length - 1)
    })

    it("if updatePin fails don't update redis", async () => {
      const userArr = [user]
      mockedUserFind.mockResolvedValueOnce(userArr)
      mockRedisGet.mockResolvedValue('slat')
      mockedUpdatePin.mockRejectedValue('error')

      await updateSaltsAndPins()
      expect(mockRedisSet).not.toBeCalled()
    })
  })
})
