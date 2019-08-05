<br />

## Initialization

The Redemptions app is initialized by passing a `Vault _vault` and `TokenManager _tokenManager` parameters. Users are then able to add tokens to Redemptions via the GUI in the DAO. This passes an Ethereum contract address to the `address[] _redemptionTokenList`array. This then allows users to redeem tokens associated to the `_tokenManager` in exchange for a proportional share of each token on the `_redemptionTokenList` held in the `_vault` address.

The Redemptions app must have the `TRANSFER_ROLE` permission on `_vault` and the `BURN_ROLE` permission on the `_tokenManager`.

<br />

## Adding Tokens

Adding tokens to the Redemptions app is done by passing an address `_token` to the addToken() function. This must be the address of a token contract.
```
function addToken(address _token) external auth(ADD_TOKEN_ROLE) {
	require(_token != address(tokenManager), ERROR_CANNOT_ADD_TOKEN_MANAGER);
	require(!tokenAdded[_token], ERROR_TOKEN_ALREADY_ADDED);
	if (_token != ETH) {
		require(isContract(_token), ERROR_TOKEN_NOT_CONTRACT);
	}
```

Adding the address to the Redemptions app does not transfer any tokens. What this does do is add a token contract address to the Redemptions app and make it eligible for redemption. If that token is in the `Vault` a user will then be able to redeem their tokens for a percentage of those tokens in the `Vault`. Concretely this looks like:
- adding the contract address to the `_redemptionTokenList` array
- mapping the token contract address to a boolean (`true`)
- emitting an event that the token has been added to the Redemptions app
```
tokenAdded[_token] = true;
redemptionTokenList.push(_token);
emit AddToken(_token);
```

<br />

## Removing Tokens

Removing tokens from the Redemptions app is done by passing an address `_token` to the removeToken() function. This must be an address that is already added to the Redemptions `tokenAdded[]` array.
```
function removeToken(address _token) external auth(REMOVE_TOKEN_ROLE) {
	require(tokenAdded[_token], ERROR_NOT_VAULT_TOKEN);
```

Removing an address from the Redemptions app does not transfer any tokens. If a token is in the `Vault` and you remove it from the Redemptions app, it will stay in the `Vault`. It will, however, no longer be eligible for redemption and will no longer show up in the Redemption app UI. Concretely this looks like:
- removing the contract address from the `_redemptionTokenList` array
- mapping the token contract address to a boolean (`false`)
- emitting an event that the token has been removed from the Redemptions app
```
tokenAdded[_token] = false;
redemptionTokenList.deleteItem(_token);
emit RemoveToken(_token);
```

<br />

## Redeeming Tokens

Anyone account that holds redemption tokens can call the `redeem(uint256 _amount)` function. This will:

1. check that the `_amount` is greater than 0
```
require(_amount > 0, ERROR_CANNOT_REDEEM_ZERO);
require(REDEEM_MESSAGE == msgHash, ERROR_INCORRECT_MESSAGE);
```

2. check the signer of the message
```
address redeemer = recoverAddr(msgHash, v, r, s);
```

3. check that the `_amount` of redemption tokens to be redeemed is > 0
```
require(tokenManager.spendableBalanceOf(redeemer) >= _amount, ERROR_INSUFFICIENT_BALANCE);
```

3. calculate the `redemptionAmount` to determine the percentage of redemption tokens held by the `redeemer`, and thus the percentage of the `Vault` that the `redeemer` is eligible to redeem.
```
uint256 redemptionAmount;
uint256 tokenBalance;
uint256 totalSupply = tokenManager.token().totalSupply();

for (uint256 i = 0; i < redemptionTokenList.length; i++) {
	tokenBalance = vault.balance(redemptionTokenList[i]);
	redemptionAmount = _amount.mul(tokenBalance).div(totalSupply);
```

4. check if there is a non-zero amount of each token in the `_redemptionTokenList`, and if so, transfer the `_redemptionAmount` of that token to the the `redeemer`.
```
if (redemptionAmount > 0)
	vault.transfer(redemptionTokenList[i], redeemer, redemptionAmount);
```

5. burn `_amount` of the user tokens associated with `_tokenManager`
```
tokenManager.burn(msg.sender, _amount
```

6. if the redeem function executes successfully it will emit an event that includes the `redeemer` and the `_amount`

<br />

## Get Tokens

Anyone can view the token contract addresses that are stored in `redemptionTokenList` by calling `getTokens()`.

<br />

## Recover Address

The way Aragon DAOs are structured, the Access Control List forwards messages between various Aragon apps. This means that the EOA/contract that signed a message is likely not to be the address that delivers it to it's destination. As such, we need to manually recover the signature from the message to determine who sent it.

```
function recoverAddr(bytes32 msgHash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
	bytes memory prefix = "\x19Ethereum Signed Message:\n32";
	bytes32 prefixedHash = keccak256(abi.encodePacked(prefix,msgHash));
	return ecrecover(prefixedHash, v, r, s);
}
```

<br />
