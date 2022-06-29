variable "namespace" {
  type = string
}

variable "app_image" {
  type = string
}

variable "region" {
  type = string
}

variable "app_count" {
  type    = number
  default = 2
}

variable "total_cpu" {
  type    = number
  default = 1024
}

variable "total_memory" {
  type    = number
  default = 3072
}

variable "fargate_cpu" {
  type    = number
  default = 768
}

variable "fargate_memory" {
  type    = number
  default = 2048
}

variable "app_port" {
  type = number
}

variable "redis_cpu" {
  type    = number
  default = 256
}

variable "redis_memory" {
  type    = number
  default = 1024
}

variable "redis_port" {
  type = number
  default = 6379
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "vpc_id" {
  type = string
}

variable "nft_storage_s3_bucket" {
  type = string
}

variable "nft_storage_url" {
  type = string
}

variable "events_queue_url" {
  type = string
}

variable "events_queue_arn" {
  type = string
}

variable "aws_security_group_ecs_tasks_id" {
  type = string
}

variable "mongodb_uri" {
  type        = string
  sensitive   = true
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
  
