# Deploy

Process to deploy infrastructural changes on the API

## Open the file `~/.aws/credentials` and include these profiles:

```
[theharvest-develop]
aws_access_key_id = ...
aws_secret_access_key = ...
```

## Development environment:

```
cd blockchain/packages/backend/infrastructure/terraform
export AWS_PROFILE=theharvest-develop
terraform init
```

## Add environment variables to Docker

[See here](https://github.com/falco-gg/blockchain/commit/c20aaa3a9708a4e8fbf1396a23f38276509556cb)

- `docker-compose.yml`
- `packages/backend/infrastructure/terraform/main.tf`
- `packages/backend/infrastructure/terraform/modules/webserver/ecs/task_definition.tf`
- `packages/backend/infrastructure/terraform/modules/webserver/ecs/vars.tf`
- `packages/backend/infrastructure/terraform/modules/webserver/main.tf`
- `packages/backend/infrastructure/terraform/modules/webserver/vars.tf`
- `packages/backend/infrastructure/terraform/vars.tf`
- `packages/backend/src/common/config/index.ts`

## Paste values from `backend-develop.conf` to `backend.tf` (make sure not to commit)

## `terraform apply -var-file=develop.tfvars`
