import axios from 'axios'

import getEnv from '../../src/updateSalts/constants/env'
import { updatePin } from '../../src/updateSalts/venly'

jest.mock('axios')
const mockAxios = axios as jest.Mocked<typeof axios>

describe('venly', () => {
  describe('updatePin', () => {
    const oldPin = 'oldPin'
    const newPin = 'newPin'
    const walletId = 'walletId'
    const token = {
      data: { access_token: 'accessToken' }
    }
    const result = {
      data: {
        success: true,
        result: {
          id: '1234'
        }
      }
    }
    beforeEach(() => {
      mockAxios.post.mockResolvedValueOnce(token)
      mockAxios.patch.mockResolvedValueOnce(result)
    })
    afterAll(() => {
      mockAxios.post.mockClear()
      mockAxios.patch.mockClear()
    })
    it('access token must be requested', async () => {
      await updatePin(oldPin, newPin, walletId)
      expect(mockAxios.post.mock.calls[0][0]).toEqual(
        'https://login-staging.arkane.network/auth/realms/Arkane/protocol/openid-connect/token'
      )
      expect(mockAxios.post.mock.calls[0][1]).toEqual(
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: getEnv('VENLY_CLIENT_ID'),
          client_secret: getEnv('VENLY_CLIENT_SECRET')
        }).toString()
      )
      expect(mockAxios.post.mock.calls[0][2]).toEqual({
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })
    })
    it('request must be sent to the correct arguments', async () => {
      await updatePin(oldPin, newPin, walletId)
      expect(mockAxios.patch.mock.calls[0][0]).toEqual(
        'https://api-wallet-staging.venly.io/api' + `/wallets/${walletId}`
      )
      expect(mockAxios.patch.mock.calls[0][1]).toEqual({
        pincode: oldPin,
        newPincode: newPin
      })
      expect(mockAxios.patch.mock.calls[0][2]).toEqual({
        headers: {
          Authorization: 'Bearer accessToken'
        }
      })
    })
    it('return correct data', async () => {
      const response = await updatePin(oldPin, newPin, walletId)
      expect(response).toEqual(result.data)
    })
  })
})
