# VPC for ECS Fargate
module "vpc_for_ecs_fargate" {
  source                  = "./vpc"
  namespace               = var.namespace
  app_port                = var.app_port
  mongo_atlas_cidr        = var.mongo_atlas_cidr
  mongo_atlas_peer_vpc_id = var.mongo_atlas_peer_vpc_id
}

# ECS cluster, task definition and service
module "ecs" {
  source    = "./ecs"
  namespace = var.namespace
  # Task definition and NLB
  app_image = "${aws_ecr_repository.ecr.repository_url}:backend"
  app_port  = var.app_port

  region                = var.region
  events_queue_url      = var.events_queue_url
  events_queue_arn      = var.events_queue_arn
  nft_storage_url       = var.nft_storage_url
  nft_storage_s3_bucket = var.nft_storage_s3_bucket

  vpc_id = module.vpc_for_ecs_fargate.vpc_id
  # Service
  aws_security_group_ecs_tasks_id = module.vpc_for_ecs_fargate.ecs_tasks_security_group_id
  private_subnet_ids              = module.vpc_for_ecs_fargate.private_subnet_ids
}

module "auto-scaling" {
  source           = "./auto-scaling"
  namespace        = var.namespace
  ecs_cluster_name = module.ecs.ecs_cluster_name
  ecs_service_name = module.ecs.ecs_service_name
}

# API Gateway and VPC link
module "api_gateway" {
  source          = "./api-gateway"
  namespace       = var.namespace
  app_port        = var.app_port
  nlb_dns_name    = module.ecs.nlb_dns_name
  nlb_arn         = module.ecs.nlb_arn
  api_domain_name = var.api_domain_name
}
