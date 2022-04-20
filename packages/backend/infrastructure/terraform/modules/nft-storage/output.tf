output "nft_storage_cdn_url" {
  value = module.cdn.cf_domain_name
}

output "nft_storage_s3_bucket" {
  value = module.cdn.s3_bucket
}
