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

output "webserver_ecs_cluster_id" {
  value = module.webserver.cluster_id
}
