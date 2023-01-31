# Decentragram-subgraph

Decentragram subgraph

##### Steps:

Create .env file with the following variables:

```
PRIV_KEY=
TESTNET_RPC_URL=
ETHERSCAN_API_KEY=
```

1. Compile and deploy contract
2. Update `abis` folder with abi of deployed contract
3. Update `subgraph.yaml` with contract address and startBlock and any event changes
4. Update `mappings.ts` logic if any changes
5. Create new subgraph in hosted service and copy subgraph slug
6. Generate types
7. Build subgraph
8. Authorize graph cli for deployment using token
9. Deploy subgraph

10. Compile and deploy contract

```shell
npm install
npx hardhat compile
npx hardhat deploy --network testnet
# verify contract
npx hardhat verify --network testnet <Deployed contract address> "<constructor1>" "<constructor2>"
```

2. Create and Deploy subgraph

```shell
yarn codegen
yarn build
graph auth https://api.thegraph.com/deploy/ <Your account's access token not subgraph's token>
yarn deploy
```
