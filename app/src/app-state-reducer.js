import BN from 'bn.js'

function appStateReducer(state) {
  if (!state) return {}

  const { tokens, redeemableToken } = state || {}
  const tokensBn = tokens
    ? tokens.map(token => ({
        ...token,
        decimals: new BN(token.decimals),
        amount: new BN(token.amount),
      }))
    : []

  const redeemableTokenBn = redeemableToken
    ? {
        ...redeemableToken,
        decimals: new BN(redeemableToken.decimals),
        accountBalance: new BN(redeemableToken.accountBalance),
        totalSupply: new BN(redeemableToken.totalSupply),
      }
    : {}

  return {
    ...state,
    tokens: tokensBn,
    redeemableToken: redeemableTokenBn,
  }
}

export default appStateReducer
