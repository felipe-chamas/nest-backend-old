import { Test, TestingModule } from '@nestjs/testing';
import { UpdateChainDto } from '../dto/update-chain.dto';
import { ChainController } from './chain.controller';
import { ChainService } from '../services/chain.service';

import { mockChain } from '../../../test/mocks/chain.mock';
import { ObjectID } from 'typeorm';
import { Chain } from '../../../common/entities';

describe('ChainController', () => {
  let controller: ChainController;
  let service: Partial<ChainService>;

  beforeEach(async () => {
    service = {
      findAll: () => Promise.resolve([mockChain as Chain]),
      findById: jest.fn().mockImplementation(async (id) => {
        return { ...mockChain, id: id as unknown as ObjectID } as Chain;
      }),
      update: (_: string, updatedUser: Partial<UpdateChainDto>) =>
        Promise.resolve({
          ...updatedUser,
        } as unknown as Chain),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainController],
      providers: [
        {
          provide: ChainService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ChainController>(ChainController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should fetch a chain', async () => {
    const result = await controller.findOne(mockChain.id.toString());

    expect(result).toMatchObject({
      block: mockChain.block,
      confirmations: mockChain.confirmations,
    });
  });

  describe('Update', () => {
    it('should update a chain', async () => {
      const updatedChain = {
        ...mockChain,
        block: 42,
      } as UpdateChainDto;

      const result = await controller.update(
        mockChain.id.toString(),
        updatedChain,
      );

      expect(result).toMatchObject(updatedChain);
    });
  });

  it('should delete a chain', () => {
    controller.remove(mockChain.id.toString());
    expect(service.remove).toHaveBeenCalledWith(mockChain.id);
  });
});
