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

  const { decimals, balance, totalSupply } = redeemableToken
  const redeemableTokenBn = redeemableToken
    ? {
        ...redeemableToken,
        decimals: new BN(decimals),
        balance: new BN(balance),
        totalSupply: new BN(totalSupply),
        numData: {
          decimals: parseInt(decimals, 10),
          totalSupply: parseInt(totalSupply, 10),
        },
      }
    : {}

  return {
    ...state,
    tokens: tokensBn,
    redeemableToken: {
      ...redeemableTokenBn,
    },
  }
}

export default appStateReducer
