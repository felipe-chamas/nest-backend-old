output "events_queue_url" {
  value = module.events-listener.events_queue_url
}

output "events_api_url" {
  value = module.events-listener.events_api_url
}

output "nft_storage_cdn_url" {
  value = module.nft-storage.nft_storage_cdn_url
}

output "nft_storage_s3_bucket" {
  value = module.nft-storage.nft_storage_s3_bucket
}

output "repository_url" {
  value = module.webserver.repository_url
}

output "webserver_api_url" {
  value = module.webserver.webserver_api_url
}

output "vpc_id" {
  value = module.webserver.vpc_id
}

output "vpc_cidr" {
  value = module.webserver.vpc_cidr
}

output "nat_gateway_ip" {
  value = module.webserver.nat_gateway_ip
}

