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