import { Expose } from 'class-transformer';
import { Chain } from 'common/entities';

@Expose()
export class ChainDto extends Chain {}
