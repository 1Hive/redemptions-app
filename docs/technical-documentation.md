<br />

## 1Hive Redemptions Docs
TODO
- explanation of each function/feature, what it does, and how to use it. 

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
    tokenManager.burn(msg.sender, _amount
```

<br />
