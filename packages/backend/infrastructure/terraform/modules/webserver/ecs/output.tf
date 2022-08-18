output "ecr_cluster_arn" {
  value = aws_ecs_cluster.main.arn
}

output "ecs_cluster_id" {
  value = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  value = aws_ecs_service.main.name
}

output "nlb_arn" {
  value = aws_lb.nlb.arn
}

output "nlb_dns_name" {
  value = aws_lb.nlb.dns_name
}

output "cloudwatch_log_group" {
  value = aws_cloudwatch_log_group.log-group.name
}
