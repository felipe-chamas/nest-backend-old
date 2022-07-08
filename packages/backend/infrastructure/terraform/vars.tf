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
