provider "aws" {
  region = "us-east-1"
}

module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "~> 3.0"

  domain_name = var.nft_storage_domain_name

  create_route53_records = false

  wait_for_validation = true

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}


module "cdn" {
  source  = "cloudposse/cloudfront-s3-cdn/aws"
  version = "0.82.5"

  namespace = var.account_alias
  stage     = terraform.workspace
  name      = var.namespace

  aliases = [var.nft_storage_domain_name]

  acm_certificate_arn = module.acm.acm_certificate_arn

  depends_on = [module.acm]

  tags = {
    Name        = var.namespace
    Environment = terraform.workspace
  }
}
