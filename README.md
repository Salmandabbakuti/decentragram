# Decentragram

Welcome to Decentragram, a short post sharing platform like Instagram and Twitter. With Decentragram, you'll be able to stay up-to-date on the latest tech trends, news, and articles in a concise and easy-to-digest format.

One of the key benefits of Decentragram is its integration with the push protocol and subgraph, ensuring that you never miss a beat. Unlike traditional web2 apps, where you may not always be notified of new content(we saw that often with youtube) or where notifications can end up in your spam folder, Decentragram makes sure you always know when a new post has been published. No more manual newsletters to sift through, and no more missed updates.

In addition to its seamless notification system, Decentragram also comes with a built-in push chat for customer support. Whether you have a question, need assistance, or just want to say hello, dedicated support team will be there to help you out.

#### Features:

- New Post Notifications using Push Protocol(Real-time)
- Persisted Notifications using Push Protocol(Fetching from Push API)
- Subgraph for indexing and notifications delivery
- Customer Support Chat using Push Chat

#### Workflow Architecture:

![Workflow Architecture](https://user-images.githubusercontent.com/29351207/215774230-f9ee0451-6b47-4889-aeac-a44eaf6e7403.png)

#### Tech Stack

- Frontend: React.js, Antd
- Web3 Client: ethers.js
- Smartcontracts: Solidity, Hardhat
- Storage: IPFS, Pinata
- Notifications: Push Protocol
- Blockchain Network: Goerli
- Indexer: The Graph

### Prerequisites

> There are some optional prerequisites that you can skip and use my deployed resources instead.

1. [Node.js](https://nodejs.org/en/download/) Nodejs version 14.17.0 or higher.
2. Private key of an Ethereum account with some ETH/Matic in it. (Optional)
3. RPC endpoint of an Ethereum node of your choice. (Optional)
4. [Metamask](https://metamask.io/) extension installed in your browser.
5. Pinata API keys.
6. The Graph Account. (Optional)

### Deployed Resources:

- [Decentragram App](https://decentragram-sage.vercel.app/)
- [Decentragram Subgraph](https://thegraph.com/hosted-service/subgraph/salmandabbakuti/decentragram)
- [Decentragram Smartcontract](https://goerli.etherscan.io/address/0x3401aE59dA159928F504DEC7F12745Da078D9890#code)
- [Decentragram Push Channel(Staging) Address: 0xc2009D705d37A9341d6cD21439CF6B4780eaF2d7](https://staging.push.org/#/channels)

#### Deploying Contract (Optional)

```

yarn install

yarn hardhat compile

yarn hardhat deploy --network testnet

# copy contract address deployed and paste it in client's .env file

```

#### Deploying Subgraph (Optional)

> Note: Update the `src/subgraph.yaml` file with the contract address deployed in the previous step. Update deploy script with your own subgraph name.
> Note: Update `subgraphID` In `src/mapping.ts` file with your subgraph slug to deliver notifications to your channel.

```

cd indexer
yarn install
yarn codegen
yarn deploy

# copy subgraph url and paste it in client's .env file

```

#### Adding Subgraph details to the Push Channel

> Create a new channel in the push protocol by following the instructions [here](https://docs.push.org/developers/developer-guides/create-your-notif-channel). Add the subgraph details to the channel by following the instructions [here](https://docs.push.org/developers/developer-guides/sending-notifications/using-subgraph-gasless).

````

### Running the client

> Copy the `.env.example` file to `.env` and fill in the required values.

```bash
cd client
yarn install
yarn dev
````

### Demo

https://user-images.githubusercontent.com/29351207/216329718-06120a96-5c89-45e1-add7-9111b1ebd43a.mp4

![Screenshot1](https://user-images.githubusercontent.com/29351207/216604389-b02fc85f-8be3-4d5d-916b-45e6823c9030.png)

![Screenshot2](https://user-images.githubusercontent.com/29351207/215773287-325e9121-c2f8-4ef0-9148-bc10c62bfa6f.png)

![Screenshot3](https://user-images.githubusercontent.com/29351207/216604896-858cc892-b1f2-488f-8ec0-3ba7cd29a68a.png)

### Safety

This is experimental software and is provided on an "as is" and "as available" basis.

Decentragram is a proof of concept and is not ready for production use. It is not audited and has not been tested for security. Use at your own risk.
I do not give any warranties and will not be liable for any loss incurred through any use of this codebase.
