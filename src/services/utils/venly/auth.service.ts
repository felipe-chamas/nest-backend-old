import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpVenlyAuthService extends HttpService {
  constructor() {
    super(axios.create({}))
  }
}
