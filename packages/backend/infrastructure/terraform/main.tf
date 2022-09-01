provider "aws" {
  region = "us-east-1"
}

module "events-listener" {
  source        = "./modules/events-listener"
  account_alias = var.account_alias
}

module "nft-storage" {
  source                  = "./modules/nft-storage"
  account_alias           = var.account_alias
  nft_storage_domain_name = var.nft_storage_domain_name
}

module "webserver" {
  source = "./modules/webserver"

  events_queue_url      = module.events-listener.events_queue_url
  events_queue_arn      = module.events-listener.events_queue_arn
  nft_storage_url       = var.nft_storage_domain_name
  nft_storage_s3_bucket = module.nft-storage.nft_storage_s3_bucket
  api_domain_name       = var.api_domain_name

  depends_on = [
    module.events-listener
    # , module.nft-storage
  ]
}

module "opensearch" {
  source = "./modules/opensearch"

  namespace                 = var.account_alias
  cloudwatch_log_group_name = module.webserver.cloudwatch_log_group

  depends_on = [
    module.webserver
  ]
}
