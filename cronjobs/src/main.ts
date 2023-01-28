import { schedule } from 'node-cron'

import updateSaltsAndPins from './updateSalts'

schedule('* 2 * * *', updateSaltsAndPins)
