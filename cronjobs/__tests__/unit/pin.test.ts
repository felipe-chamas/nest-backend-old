import { generateNewSalt, calculatePin } from '../../src/updateSalts/pin'

describe('Pin', () => {
  describe('generateNewSalt', () => {
    it('must return a valid salt', () => {
      const salt = generateNewSalt()
      expect(salt.length).toBeGreaterThan(30)
      expect(typeof salt).toEqual('string')
    })
  })
  describe('calculatePin', () => {
    const uuid = 'uuid'
    const slat = 'salt'
    it('return a valid pin', () => {
      const pin = calculatePin(uuid, slat)
      expect(/^\d{6}$/.test(pin)).toEqual(true)
    })
    it('return same pin for the same uuid and salt', () => {
      const pin1 = calculatePin(uuid, slat)
      const pin2 = calculatePin(uuid, slat)
      expect(pin1).toEqual(pin2)
    })
    it('return different pin for the different uuid and salt', () => {
      const pins = [
        calculatePin(uuid, slat),
        calculatePin(uuid + '2', slat),
        calculatePin(uuid, slat + '3'),
        calculatePin(uuid + '4', slat + '4')
      ]
      const length = pins.length
      for (let i = 0; i < length; i += 1) {
        for (let j = 0; j < length; j += 1) {
          if (j === i) continue
          expect(pins[i]).not.toEqual(pins[j])
        }
      }
    })
  })
})
