# Redemptions <img align="right" src="https://github.com/1Hive/website/blob/master/website/static/img/bee.png" height="80px" />

1Hive's Redemptions app allows Aragon organizations to grant their token holders the right to redeem tokens in exchange for a proportional share of the organizations treasury assets.

#### 🐲 Project stage: development
The Redemptions app is still in development and hasn't been published to APM. If you are interested in contributing please see our open [issues](https://github.com/1hive/redemptions/issues).

#### 🚨 Security review status: pre-audit
The code in this repo has not been audited.

## How does it work

The Redemptions app is initialized by passing a `Vault _vault`, `TokenManager _tokenManager`, and `address[] _vaultTokens`. Users are able to redeem tokens associated the `_tokenManager` in exchange for a proportional share of `_vaultTokens` held in the `_vault` address.

The Redemptions app must have the `TRANSFER_ROLE` permission on `_vault` and the `BURN_ROLE` permission  on the `_tokenManager`. 

When a user calls the `redeem(uint256 _amount)` function they must have > `_amount` tokens available. The Redemptions app will:
1. transfer an amount of each token in the `_vaultTokens` array to the user.
```        
        for (uint256 i = 0; i < vaultTokens.length; i++) {
            redemptionAmount = _amount.mul(vault.balance(vaultTokens[i])).div(tokenManager.token().totalSupply());
            vault.transfer(vaultTokens[i], msg.sender, redemptionAmount);
        } 
```
2. burn `_amount` of the users tokens associated with `_tokenManager`
```
tokenManager.burn(msg.sender, _amount);
```

## How to run

To run deploy a test organization locally:

``` aragon run --template Template --template-init @ARAGON_ENS ```

## How to deploy to an organization  
