import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpElixirApiService extends HttpService {
  constructor() {
    super(
      axios.create({
        baseURL: 'https://kend.elixir.app',
        headers: {
          Accept: 'application/json'
        }
      })
    )
  }
}
