import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpQuicknodeApiService extends HttpService {
  constructor() {
    super(
      axios.create({
        headers: {
          Accept: 'application/json'
        }
      })
    )
  }
}
