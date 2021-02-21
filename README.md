# Redemptions <img align="right" src="https://github.com/1Hive/website/blob/master/website/static/img/bee.png" height="80px" />

[![CircleCI](https://circleci.com/gh/1Hive/redemptions-app.svg?style=svg)](https://circleci.com/gh/1Hive/redemptions-app)
[![Coverage Status](https://coveralls.io/repos/github/1Hive/redemptions-app/badge.svg?branch=master&service=github)](https://coveralls.io/github/1Hive/redemptions-app?branch=master&service=github)
[![Crytic Status](https://crytic.io/api/repositories/i8VojaU5RTS5vHfn4MtivQ/badge.svg?token=d24cea18-e929-4f0a-8a2c-9c7122593348)](https://crytic.io/1Hive/redemptions-app)

1Hive's Redemptions app allows Aragon organizations to grant their token holders the right to redeem tokens in exchange for a proportional share of the organizations treasury assets.

#### 🐲 Project Stage: Mainnet

The Redemptions app has been published to `aragonpm.eth` on Mainnet and Rinkeby networks. If you experience any issues or are interested in contributing please see review our open [issues](https://github.com/1hive/redemptions/issues).

#### 🚨 Security Review Status: [Contracts audited](https://diligence.consensys.net/audits/2019/12/dandelion-organizations/)

## How to try Redemptions immediately

We have a [Redemptions demo DAO live on Rinkeby!](https://rinkeby.aragon.org/#/tryredemptions/0x18a9713625256548670ad979d51a6b9fad5b6c45)

## How to run Redemptions locally

First make sure that you have node and yarn installed and working. You'll also need to have [Metamask](https://metamask.io) or some kind of web wallet enabled to sign transactions in the browser.

Git clone this repo.

```sh
git clone https://github.com/1Hive/redemptions-app.git
```

Navigate into the `redemptions-app` directory.

```sh
cd redemptions-app
```

Install npm dependencies.

```sh
yarn
```

Deploy a dao with Redemptions installed on your local environment.

```sh
yarn start
```

If everything is working correctly, your new DAO will be deployed and your browser will open http://localhost:3000/#/YOUR-DAO-ADDRESS. It should look something like this:

![newly deployed dao with Redemptions](https://imgur.com/3Q2N0dh)

You will also see the configuration for your local deployment in the terminal. It should look something like this:

```sh
backend  | ENS deployed: 0x5f6F7E8cc7346a11ca2dEf8f827b7a0b612c56a1
backend  | DAO factory deployed: 0x8EEaea23686c319133a7cC110b840d1591d9AeE0
backend  | APM deployed: 0xA53dE0b8e08b798f975D57f48384C177D410d170
backend  | Deploying DAO and app repository...
backend  | DAO deployed: YOUR-DAO-ADDRESS

```

You will also have deployed contracts for ANT, DAI, OMG, and ETH to your local testnet. The terminal will display the names of the tokens and their addresses on your local testnet. It should look something like this:

```sh
Token  Address                                     Balance
-----  ------------------------------------------  -------
ANT    0x7F381a654914a4C865123B33fD8178efc0Ee5C2D  40
DAI    0xB5Cc76D092aA440087447EBD3A29E9E0b8A4bf9E  100
OMG    0x3d09CfCdD3136aaE7A4B26875A7BAcA0C3d8A03b  14189
ETH    0x0000000000000000000000000000000000000000  0.1
```

Now if you navigate back to your browser (http://localhost:3000/#/YOUR-DAO-ADDRESS) you'll be able to open the Redemptions app and add one of these tokens to your locally deployed Redemptions app.

## How to deploy Redemptions to an organization

Redemptions has been published to APM on Mainnet, Rinkeby, and xDAI at `redemptions.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> redemptions.aragonpm.eth --app-init-args <vault-address> <token-manager-address> <redeemable-tokens>
```

The Redemptions app must have the `TRANSFER_ROLE` permission on `Vault` and the `BURN_ROLE` permission on the `Token Manager`.

## Contributing

We welcome community contributions!

Please check out our [open Issues](https://github.com/1Hive/redemptions-app/issues) to get started.

If you discover something that could potentially impact security, please notify us immediately. The quickest way to reach us is via the #dev channel in our [Discord chat](https://discord.gg/mP75t4n). Just say hi and that you discovered a potential security vulnerability and we'll DM you to discuss details.
