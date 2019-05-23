# Redemptions <img align="right" src="https://github.com/1Hive/website/blob/master/website/static/img/bee.png" height="80px" />

1Hive's Redemptions app allows Aragon organizations to grant their token holders the right to redeem tokens in exchange for a proportional share of the organizations treasury assets.

#### 🐲 Project stage: development

The Redemptions app is still in development and hasn't been published to APM. If you are interested in contributing please see our open [issues](https://github.com/1hive/redemptions/issues).

#### 🚨 Security review status: pre-audit

The code in this repo has not been audited.

## How does it work

The Redemptions app is initialized by passing a `Vault _vault`, `TokenManager _tokenManager`, and `address[] _redemptionTokenList`. Users are able to redeem tokens associated to the `_tokenManager` in exchange for a proportional share of each token on the `_redemptionTokenList` held in the `_vault` address.

The Redemptions app must have the `TRANSFER_ROLE` permission on `_vault` and the `BURN_ROLE` permission on the `_tokenManager`.

When a user calls the `redeem(uint256 _amount)` function they must have >= `_amount` of tokens available. The Redemptions app will:

1. transfer an amount of each token in the `_redemptionTokenList` array to the user.

```
    for (uint256 i = 0; i < redemptionTokenList.length; i++) {
        redemptionAmount = _amount.mul(vault.balance(redemptionTokenList[i])).div(tokenManager.token().totalSupply());
        vault.transfer(redemptionTokenListredemptionTokenList[i], msg.sender, redemptionAmount);
    }
```

2. burn `_amount` of the user tokens associated with `_tokenManager`

```
    tokenManager.burn(msg.sender, _amount);
```

## How to run

Run a testing dao with the redemptions app already deployed on your local envrionment:

`npx aragon run --template Template --template-init @ARAGON_ENS`

This command will output the configuration for deployment:

```sh
    Ethereum Node: ws://localhost:8545
    ENS registry: 0x5f6f7e8cc7346a11ca2def8f827b7a0b612c56a1
    APM registry: aragonpm.eth
    DAO address: <dao-address>
```

We will use the `dao-address` to run a truffle script to deploy some test tokens to interact with.

`npx truffle exec scripts/deploy-tokens.js <dao-address>`

## How to deploy to an organization

// TODO:
