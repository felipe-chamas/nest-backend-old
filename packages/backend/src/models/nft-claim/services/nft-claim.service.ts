import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'common/decorators';
import { NftClaim } from 'common/entities';
import { recoveryAgent } from 'common/utils';
import { FindConditions, FindManyOptions, ObjectID, Repository } from 'typeorm';
import { CreateNftClaimDto } from '../dto/create-nft-claim.dto';
import { UpdateNftClaimDto } from '../dto/update-nft-claim.dto';

@Injectable()
export class NftClaimService {
  constructor(
    @InjectRepository(NftClaim)
    private readonly nftClaimRepo: Repository<NftClaim>
  ) {}

  async create(createNftClaimDto: CreateNftClaimDto) {
    const nftClaim = this.nftClaimRepo.create(createNftClaimDto);
    await this.nftClaimRepo.save(nftClaim);
    return nftClaim;
  }

  async findAll(options?: FindManyOptions<NftClaim> | Pagination) {
    return await this.nftClaimRepo.find(options);
  }

  async findOne(idOrNftClaim: string | FindConditions<NftClaim>) {
    let nftClaim: NftClaim;

    switch (true) {
      case typeof idOrNftClaim === 'string': {
        nftClaim = await this.nftClaimRepo.findOne(idOrNftClaim as string);
        break;
      }
      case typeof idOrNftClaim === 'object': {
        nftClaim = await this.nftClaimRepo.findOne(
          idOrNftClaim as FindConditions<NftClaim>
        );
        break;
      }
    }
    if (!nftClaim)
      throw new NotFoundException(
        `NftClaim ${JSON.stringify(idOrNftClaim)} not found`
      );

    return nftClaim;
  }

  async update(
    idOrNftClaim: string | NftClaim,
    updateNftClaimDto: UpdateNftClaimDto
  ) {
    let nftClaim: NftClaim;

    switch (true) {
      case typeof idOrNftClaim === 'string': {
        nftClaim = await this.nftClaimRepo.findOne(idOrNftClaim as string);
        if (!nftClaim)
          throw new NotFoundException(
            `NftClaim with id ${idOrNftClaim} not found`
          );
        break;
      }
      case typeof idOrNftClaim === 'object': {
        nftClaim = idOrNftClaim as NftClaim;
        break;
      }
    }

    const newNftClaim = { ...nftClaim, ...updateNftClaimDto };
    return await this.nftClaimRepo.save(newNftClaim);
  }

  async remove(id: string) {
    const nftClaim = await this.nftClaimRepo.findOne(id);
    if (!nftClaim) throw new NotFoundException(`Nft with id ${id} not found`);

    return await this.nftClaimRepo.softRemove(nftClaim);
  }

  async recover(id?: ObjectID) {
    return await recoveryAgent(this.nftClaimRepo, id);
  }
}
