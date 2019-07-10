# Redemptions <img align="right" src="https://github.com/1Hive/website/blob/master/website/static/img/bee.png" height="80px" />

[![CircleCI](https://circleci.com/gh/1Hive/redemptions.svg?style=svg)](https://circleci.com/gh/1Hive/redemptions)
[![Coverage Status](https://coveralls.io/repos/github/1hive/redemptions/badge.svg?branch=master)](https://coveralls.io/github/1hive/redemptions?branch=master)

1Hive's Redemptions app allows Aragon organizations to grant their token holders the right to redeem tokens in exchange for a proportional share of the organizations treasury assets.

#### 🐲 Project stage: Rinkeby

The Redemptions app has been published to `open.aragonpm.eth` on the Rinkeby test network. If you experience any issues or are interested in contributing please see review our open [issues](https://github.com/1hive/redemptions/issues).

#### 🚨 Security review status: pre-audit

The code in this repo has not been audited.

## How to run locally

Run a testing dao with the redemptions app already deployed on your local envrionment:

```sh
npm run start:template
```

This command will output the configuration for deployment:

```sh
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: <dao-address>
```

We will use the `dao-address` to run a truffle script to deploy some test tokens to interact with.

```sh
npm run deploy-tokens <dao-address>
```

## How to deploy to an organization

Redemptions has been published to APM on rinkeby at `redemptions.open.aragonpm.eth`

To deploy to an organization you can use the [Aragon CLI](https://hack.aragon.org/docs/cli-intro.html).

```sh
aragon dao install <dao-address> redemptions.open.aragonpm.eth --app-init-args <vault-address> <token-manager-address>
```

The Redemptions app must have the `TRANSFER_ROLE` permission on `Vault` and the `BURN_ROLE` permission on the `Token Manager`.

## Using redemptions

The redemptions app allows organizations to add and remove tokens from a list of eligible tokens. When a user choses to redeem tokens they will receive a proportional share of all eligible tokens in the `Vault`.

### Redeeming tokens:

To redeem tokens, click on the redeem then use the slider to select how many tokens you would like to redeem. When satified with the amount, click redeem to confirm. You will be prompted to sign a message, then you will be able to confirm the transaction.

<p align="center">
    <img src="https://raw.githubusercontent.com/1Hive/redemptions-app/master/docs/resources/redeem.gif" width="600" />
</p>

### Adding eligible vault token:

To add an eligble token click "Add Token", then enter the address of the token contract you would like to add.

### Removing eligible vault token:

To remove an eligble token, hover over the token you want to remove and click "Remove Token", then enter the address of the token contract you would like to remove.
