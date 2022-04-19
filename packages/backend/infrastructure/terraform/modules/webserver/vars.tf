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

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "create_ecs" {
  type    = bool
  default = true
}

variable "namespace" {
  type    = string
  default = "webserver"
}

variable "region" {
  type    = string
  default = "us-east-1"
}