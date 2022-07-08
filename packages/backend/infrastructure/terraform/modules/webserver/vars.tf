variable "nft_storage_url" {
  type = string
}

variable "nft_storage_s3_bucket" {
  type = string
}

variable "events_queue_url" {
  type = string
}

variable "events_queue_arn" {
  type = string
}

variable "api_domain_name" {
  type = string
}

variable "app_port" {
  type    = number
  default = 3000
}

variable "namespace" {
  type    = string
  default = "webserver"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "mongodb_uri" {
  type      = string
  sensitive = true
}

variable "discord_client_id" {
  type      = string
  sensitive = true
}

variable "discord_client_secret" {
  type      = string
  sensitive = true
}

variable "discord_redirect_uri" {
  type      = string
  sensitive = true
}

variable "docs_token" {
  type      = string
  sensitive = true
}
