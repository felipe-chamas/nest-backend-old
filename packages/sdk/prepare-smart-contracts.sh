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
# remove BaseContract because it is not used and overlaps by name
# with ethers BaseContract
#
# remove contract files
rm src/typechain/BaseContract.ts
rm src/typechain/factories/BaseContract__factory.ts
# remove contract mentions
sed -i "s/^export type { BaseContract }.*$//" src/typechain/index.ts
sed -i "s/^export { BaseContract__factory }.*$//" src/typechain/index.ts
# remove hardhad definition file
rm src/typechain/hardhat.d.ts

ts-node --project tsconfig.hardhat.json generate-helper-types.ts
