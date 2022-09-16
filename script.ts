import axios from 'axios'

const main = () => {
  const baseURL = 'https://api.theharvestgame.xyz/api'
  const api = axios.create({
    baseURL,
    headers: {
      'X-API-Key': 'oxxxFaeFqQfvoMfE1soDKiafA9ZTppQgYtHN5fThd8deVXd79J9I255Net1Lw36V'
    }
  })
}

main()
