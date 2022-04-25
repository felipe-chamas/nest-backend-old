import { ParsiqEvent } from '../sqs.service';

export default async function transfer(
  parsiqEvent: ParsiqEvent
): Promise<void> {
  console.log(parsiqEvent);
}
