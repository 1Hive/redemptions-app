# Redemptions <img align="right" src="https://github.com/1Hive/website/blob/master/website/static/img/bee.png" height="80px" />

[![CircleCI](https://circleci.com/gh/1Hive/redemptions-app.svg?style=svg)](https://circleci.com/gh/1Hive/redemptions-app)
[![Coverage Status](https://coveralls.io/repos/github/1Hive/redemptions-app/badge.svg?branch=master&service=github)](https://coveralls.io/github/1Hive/redemptions-app?branch=master&service=github)
[![Crytic Status](https://crytic.io/api/repositories/i8VojaU5RTS5vHfn4MtivQ/badge.svg?token=d24cea18-e929-4f0a-8a2c-9c7122593348)](https://crytic.io/1Hive/redemptions-app)

1Hive's Redemptions app allows Aragon organizations to grant their token holders the right to redeem tokens in exchange for a proportional share of the organizations treasury assets.

#### 🐲 Project Stage: Rinkeby

The Redemptions app has been published to `open.aragonpm.eth` on the Rinkeby test network. If you experience any issues or are interested in contributing please see review our open [issues](https://github.com/1hive/redemptions/issues).

#### 🚨 Security Review Status: pre-audit

The code in this repo has not been audited.


## How to try Redemptions immediately

We have a [Redemptions demo DAO live on Rinkeby!](https://rinkeby.aragon.org/#/tryredemptions/0x18a9713625256548670ad979d51a6b9fad5b6c45)


## How to run Redemptions locally

First make sure that you have node, npm, and the Aragon CLI installed and working. Instructions on how to set that up can be found [here](https://hack.aragon.org/docs/cli-intro.html). You'll also need to have [Metamask](https://metamask.io) or some kind of web wallet enabled to sign transactions in the browser.

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
npm i
```

Deploy a dao with Redemptions installed on your local environment.
```sh
npm run start:template
```

If everything is working correctly, your new DAO will be deployed and your browser will open http://localhost:3000/#/YOUR-DAO-ADDRESS. It should look something like this:

![newly deployed dao with Redemptions](https://i.imgur.com/Kixxqr0.png)

You will also see the configuration for your local deployment in the terminal. It should look something like this:

```sh
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: YOUR-DAO-ADDRESS
```

Currently the only thing deployed on your local testnet is an Aragon DAO with the Redemptions app. In a new terminal navigate to the `redemptions-app` directory. Then run this script to deploy some token contracts on your local testnet to interact with.

```sh
npm run deploy-tokens YOUR-DAO-ADDRESS
```

If successful, you will have deployed contracts for ANT, DAI, OMG, and ETH to your local testnet. The terminal will then display the names of the tokens and their addresses on your local testnet. It should look something like this:

```sh
------------------------------------------------
ANT 0x129711C337489538cCcbc0EFf52098a46bCF0705 Balance: 40
DAI 0xBf61048590B6FAd46Fb446aA241fA33f7a22851b Balance: 100
OMG 0xC56a94cB177B297A9f4fe11781CE4E2eD1829f8B Balance: 14189
ETH 0x0000000000000000000000000000000000000000 Balance: 2
------------------------------------------------
```

Now if you navigate back to your browser (http://localhost:3000/#/YOUR-DAO-ADDRESS) you'll be able to open the Redemptions app and add one of these tokens to your locally deployed Redemptions app.


## How to deploy Redemptions to an organization

Redemptions has been published to APM on rinkeby at `redemptions.open.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> redemptions.open.aragonpm.eth --app-init-args <vault-address> <token-manager-address>
```

The Redemptions app must have the `TRANSFER_ROLE` permission on `Vault` and the `BURN_ROLE` permission on the `Token Manager`.


## Contributing

We welcome community contributions!

Please check out our [open Issues]() to get started.

If you discover something that could potentially impact security, please notify us immediately. The quickest way to reach us is via the #dev channel in our [team Keybase chat](https://1hive.org/contribute/keybase). Just say hi and that you discovered a potential security vulnerability and we'll DM you to discuss details.
