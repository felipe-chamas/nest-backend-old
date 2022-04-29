set -e
# (cd...; cmd1; cmd2) - allows to execute command in different
# directory without changing cwd of initial script
(
  cd node_modules/@blockchain/smart-contracts;
  # create separate hardhat config without `tasks` module
  # imported because they are not required for build
  sed "/^import '.\/tasks/s/^/\/\//" hardhat.config.ts > hardhat.build.config.ts;
  # install dependencies of smart-contracts
  yarn --ignore-scripts;
  npx hardhat --config hardhat.build.config.ts clean;
  npx hardhat --config hardhat.build.config.ts compile;
  rm hardhat.build.config.ts;
)
rm -rf src/typechain cache artifacts tasks scripts
cp -r node_modules/@blockchain/smart-contracts/typechain src/typechain
cp -r node_modules/@blockchain/smart-contracts/{cache,artifacts,tasks,scripts} .
ts-node generate-helper-types.ts
