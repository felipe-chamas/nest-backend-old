provider "aws" {
  region = "us-east-1"
}

module "events-listener" {
  source        = "./modules/events-listener"
  account_alias = var.account_alias
}

module "nft-storage" {
  source        = "./modules/nft-storage"
  account_alias = var.account_alias
  domain_name   = var.domain_name
}

module "webserver" {
  source                = "./modules/webserver"
  events_queue_url      = module.events-listener.events_queue_url
  events_queue_arn      = module.events-listener.events_queue_arn
  nft_storage_url       = var.domain_name
  nft_storage_s3_bucket = module.nft-storage.nft_storage_s3_bucket

  depends_on = [module.events-listener, module.nft-storage]
}