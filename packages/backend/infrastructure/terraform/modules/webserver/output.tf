output "repository_url" {
  value = aws_ecr_repository.ecr.repository_url
}

output "webserver_api_url" {
  value = module.api_gateway.webserver_api_url
}

output "vpc_id" {
  value = module.vpc_for_ecs_fargate.vpc_id
}

output "vpc_cidr" {
  value = module.vpc_for_ecs_fargate.vpc_cidr
}

output "nat_gateway_ip" {
  value = module.vpc_for_ecs_fargate.nat_gateway_ip
}
