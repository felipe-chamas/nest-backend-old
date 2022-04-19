.DEFAULT_GOAL := help
.PHONY: update
include .env

###################################################################################################
## SCRIPTS
###################################################################################################

define PRINT_HELP_PYSCRIPT
import re, sys

for line in sys.stdin:
	match = re.match(r'^([\w-]+):.*?## (.*)$$', line)
	if match:
		target, help = match.groups()
		line = '{: <20} {}'.format(target, help)
		line = re.sub(r'^({})'.format(target), '\033[96m\\1\033[m', line)
		print(line)
endef

###################################################################################################
## VARIABLES
###################################################################################################

export PYTHON=python3
export REGION=us-east-1
export PRINT_HELP_PYSCRIPT

###################################################################################################
## GENERAL COMMANDS
###################################################################################################

help: ## show this message
	@$(PYTHON) -c "$$PRINT_HELP_PYSCRIPT" < $(MAKEFILE_LIST)


setup: ## setup which environment will be deployed
	cp workspaces/$(STAGE)/* terraform/


terraform-workspace: ## create terraform workspace (e.g. develop, production)
	( cd bootstrap; terraform workspace new $(STAGE) )
	( cd terraform; terraform workspace new $(STAGE) )


terraform-bootstrap: ## create terraform S3/DynamoDB backend, which is necessary for all other operations (should run only once)
	( cd bootstrap; terraform workspace select $(STAGE) )
	( cd bootstrap; terraform init && terraform apply )


lint:
	( cd terraform; terraform fmt -recursive )
	( cd terraform; tflint .)


init: ## initialize terraform backend state
	( cd terraform; sed -i.bak 's/$${var.account_alias}/$(ACCOUNT_ALIAS)/' backend-$(STAGE).conf && rm backend-$(STAGE).conf.bak )
	( cd terraform; terraform init -backend-config=backend-$(STAGE).conf )
	( cd terraform; sed -i.bak 's/$(ACCOUNT_ALIAS)/$${var.account_alias}/' backend-$(STAGE).conf && rm backend-$(STAGE).conf.bak )


apply: ## updates terraform infrastructure
	( make init )
	( cd terraform; terraform workspace select $(STAGE) )
	( cd terraform; terraform apply -var="account_alias=$(ACCOUNT_ALIAS)" -var="api_domain_name=$(API_DOMAIN_NAME)" -var="nft_storage_domain_name=$(NFT_STORAGE_DOMAIN_NAME)" -var="mongo_atlas_cidr=$(MONGO_ATLAS_CIDR)"  -var="mongo_atlas_peer_vpc_id=$(MONGO_ATLAS_PEER_VPC_ID)" )


output: ## get terraform output
	( cd terraform; terraform workspace select $(STAGE) )
	( cd terraform; terraform output )


build: ## build Docker image
	( cd ../../..; docker build --platform linux/amd64 -t backend .)


push: ## push Docker image to ECR
	( DOCKER_REPOSITORY_URL=$$(cd terraform; terraform output -raw repository_url); \
		aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $$DOCKER_REPOSITORY_URL; \
		echo $$DOCKER_REPOSITORY_URL:backend; \
		docker tag backend $$DOCKER_REPOSITORY_URL:backend; \
		docker push $$DOCKER_REPOSITORY_URL:backend; \
	)

destroy: ## destroy terraform infrastructure
	( cd terraform; terraform workspace select $(STAGE) )
	( cd terraform; terraform destroy )
