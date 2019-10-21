export const MODE = {
  ADD_TOKEN: 'add',
  REMOVE_TOKEN: 'remove',
  REDEEM_TOKENS: 'redeem',
}

export const getModeTag = mode => {
  return mode === MODE.REDEEM_TOKENS
    ? 'Redeem'
    : `${mode === MODE.ADD_TOKEN ? 'Add' : 'Remove'} token`
}
