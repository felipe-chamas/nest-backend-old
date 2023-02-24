import { PinService } from '@services/utils/venly/pin.service'

export const mockPinService: Partial<PinService> = {
  newPin: jest.fn().mockImplementation(async (uuid: string) => {
    if (!uuid) throw new Error('uuid missing')
    return '123456'
  }),
  getPin: jest.fn().mockImplementation(async (uuid: string) => {
    if (!uuid) throw new Error('missing argument')
    return '123456'
  })
}
