output "cluster_id" {
  value = concat(aws_ecs_cluster.ecs.*.id, [""])[0]
}

output "repository_url" {
  value = aws_ecr_repository.ecr.repository_url
}
