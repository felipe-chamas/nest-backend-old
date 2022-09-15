import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpVenlyApiService extends HttpService {
  constructor() {
    super(axios.create({}))
  }
}
