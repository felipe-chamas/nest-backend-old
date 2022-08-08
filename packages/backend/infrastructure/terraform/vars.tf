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

variable "steam_api_key" {
  type      = string
  sensitive = true
}

variable "steam_return_url" {
  type      = string
  sensitive = true
}

variable "steam_realm" {
  type      = string
  sensitive = true
}

variable "frontend_url" {
  type      = string
  sensitive = true
}

variable "docs_token" {
  type      = string
  sensitive = true
}

variable "quicknode_uri" {
  type      = string
  sensitive = true
}
