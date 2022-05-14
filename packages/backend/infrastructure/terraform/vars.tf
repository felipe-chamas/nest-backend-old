variable "account_alias" {
  type = string
}

variable "nft_storage_domain_name" {
  type = string
}

variable "api_domain_name" {
  type = string
}

variable "mongodb_uri" {
  type      = string
  sensitive = true
}