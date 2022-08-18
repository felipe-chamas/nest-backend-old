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
  mongodb_uri           = var.mongodb_uri
  discord_client_id     = var.discord_client_id
  discord_client_secret = var.discord_client_secret
  discord_redirect_uri  = var.discord_redirect_uri
  steam_api_key         = var.steam_api_key
  steam_return_url      = var.steam_return_url
  steam_realm           = var.steam_realm
  frontend_url          = var.frontend_url
  docs_token            = var.docs_token
  quicknode_uri         = var.quicknode_uri
  venly_client_id       = var.venly_client_id
  venly_client_secret   = var.venly_client_secret
  venly_application_id  = var.venly_application_id

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
