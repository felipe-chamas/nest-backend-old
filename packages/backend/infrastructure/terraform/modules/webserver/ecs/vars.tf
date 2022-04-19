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

variable "fargate_cpu" {
  type    = number
  default = 1024
}

variable "fargate_memory" {
  type    = number
  default = 2048
}

variable "app_port" {
  type = number
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
