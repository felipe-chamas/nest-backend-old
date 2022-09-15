import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpMoralisApiService extends HttpService {
  constructor() {
    super(
      axios.create({
        baseURL: 'https://deep-index.moralis.io/api/v2',
        headers: {
          Accept: 'application/json'
        }
      })
    )
  }
}
