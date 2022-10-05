import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class HttpSteamApiService extends HttpService {
  constructor() {
    super(
      axios.create({
        baseURL: 'https://api.steampowered.com',
        headers: {
          Accept: 'application/json'
        }
      })
    )
  }
}
