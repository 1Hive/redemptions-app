<br />

## Initialization

The Redemptions app is initialized by passing a `Vault _vault` and `TokenManager _tokenManager` parameters.
- `_vault` is an [Aragon Vault](https://wiki.aragon.org/dev/apps/vault/) contract
- `_tokenManager` is an [Aragon Token Manager](https://wiki.aragon.org/dev/apps/token-manager/) contract

The Redemptions app must have the `TRANSFER_ROLE` permission on `_vault` and the `BURN_ROLE` permission on the `_tokenManager`.

<br />

## Adding Tokens

Adding tokens to the Redemptions app is done by passing an address `_token` to the addRedeemableToken() function. This must be the address of a token contract.
```
function addRedeemableToken(address _token) external auth(ADD_TOKEN_ROLE) {
	require(_token != address(tokenManager), ERROR_CANNOT_ADD_TOKEN_MANAGER);
	require(!redeemableTokenEnabled[_token], ERROR_TOKEN_ALREADY_ADDED);
	if (_token != ETH) {
		require(isContract(_token), ERROR_TOKEN_NOT_CONTRACT);
	}
```

Adding the address to the Redemptions app does not transfer any tokens. What this does do is add a token contract address to the Redemptions app and make it eligible for redemption. If that token is in the `Vault` a user will then be able to redeem their tokens for a percentage of those tokens in the `Vault`. Concretely this looks like:
- adding the contract address to the `_redeemableTokens` array
- mapping the token contract address to a boolean (`true`)
- emitting an event that the token has been added to the Redemptions app
```
	redeemableTokenEnabled[_token] = true;
	redeemableTokens.push(_token);
	emit AddRedeemableToken(_token);
}
```

<br />

## Removing Tokens

Removing tokens from the Redemptions app is done by passing an address `_token` to the removeRedeemableToken() function. This must be an address that is already added to the Redemptions `redeemableTokenEnabled` mapping.
```
function removeRedeemableToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
	require(redeemableTokenEnabled[_token], ERROR_NOT_VAULT_TOKEN);
```

Removing an address from the Redemptions app does not transfer any tokens. If a token is in the `Vault` and you remove it from the Redemptions app, it will stay in the `Vault`. It will, however, no longer be eligible for redemption and will no longer show up in the Redemption app UI. Concretely this looks like:
- removing the contract address from the `_redeemableTokens` array
- mapping the token contract address to a boolean (`false`)
- emitting an event that the token has been removed from the Redemptions app
```
	redeemableTokenEnabled[_token] = false;
	redeemableTokens.deleteItem(_token);
	emit RemoveRedeemableToken(_token);
}
```

<br />

## Redeeming Tokens

Accounts that hold redemption tokens can call the `redeem(uint256 _amount)` function. This will:

1. check that the `_amount` is greater than 0
```
require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
```

2. check that the msg.sender has a balance of redemption tokens greater than or equal to the amount they would like to redeem
```
require(tokenManager.spendableBalanceOf(msg.sender) >= _amount, ERROR_INSUFFICIENT_BALANCE);
```

4. calculate the `redemptionAmount` to determine the percentage of redemption tokens held by the `redeemer`, and thus the percentage of the eligible tokens in the `Vault` that the `msg.sender` is eligible to redeem.
```
uint256 redemptionAmount;
uint256 tokenBalance;
uint256 totalSupply = tokenManager.token().totalSupply();

for (uint256 i = 0; i < redeemableTokens.length; i++) {
	tokenBalance = vault.balance(redeemableTokens[i]);
	redemptionAmount = _amount.mul(tokenBalance).div(totalSupply);
```

4. check if there is a non-zero amount of each token in the `_redeemableTokens`, and if so, transfer the `_redemptionAmount` of that token to the `redeemer`.
```
if (redemptionAmount > 0)
	vault.transfer(redeemableTokens[i], redeemer, redemptionAmount);
```

5. burn `_amount` of the msg.sender's redemption tokens
```
tokenManager.burn(msg.sender, _amount);
```

6. if the redeem function executes successfully it will emit an event that includes the `redeemer` and the `_amount`
```
emit Redeem(msg.sender, _amount);
```

<br />

## Get Tokens

Anyone can view the token contract addresses that are stored in `redeemableTokens` by calling `getRedeemableTokens()`.

<br />
