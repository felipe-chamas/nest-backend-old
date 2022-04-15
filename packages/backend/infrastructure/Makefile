.DEFAULT_GOAL := help
.PHONY: update

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
	( cd terraform; terraform apply -var="account_alias=$(ACCOUNT_ALIAS)" -var="domain_name=$(DOMAIN_NAME)" )


output: ## get terraform output
	( cd terraform; terraform workspace select $(STAGE) )
	( cd terraform; terraform output )


push: ## push Docker image to ECR
	( docker build ../../.. -t backend )
	( DOCKER_REPOSITORY_URL=$$(cd terraform; terraform output -raw repository_url); \
		aws ecr get-login-password --region $(REGION) | docker login --username AWS --password-stdin $(DOCKER_REPOSITORY_URL); \
		echo $$DOCKER_REPOSITORY_URL:backend; \
		docker tag backend $$DOCKER_REPOSITORY_URL:backend; \
		docker push $$DOCKER_REPOSITORY_URL:backend; \
	)

destroy: ## destroy terraform infrastructure
	( cd terraform; terraform workspace select $(STAGE) )
	( cd terraform; terraform destroy )
