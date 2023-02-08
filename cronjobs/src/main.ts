import { schedule } from 'node-cron'

import updateSaltsAndPins from './updateSalts'

schedule('0 2 * * *', updateSaltsAndPins)
