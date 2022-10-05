import { ConfigService } from '@nestjs/config'

export const mockConfigService: Partial<ConfigService> = {
  get: () => ''
}
