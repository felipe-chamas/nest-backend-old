import { Chain } from '../../common/entities/chain.entity';
import { CreateChainDto, UpdateChainDto } from 'models/chain/dto';

export const mockChain = {
  id: '624b3c3adb4b27a36fc4d450',
  chainId: {
    namespace: 'eip155',
    reference: '56',
  },
  block: 19316981,
  confirmations: 10,
} as unknown as Chain;

export const mockCreateChain: CreateChainDto = {
  chainId: {
    namespace: 'eip155',
    reference: '56',
  },
  block: 19316981,
  confirmations: 10,
};

export const mockUpdateChain: UpdateChainDto = {
  block: 20316981,
};
