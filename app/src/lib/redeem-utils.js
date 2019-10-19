export const reducer = (state, { type, amount }) => {
  switch (type) {
    case 'BALANCE_UPDATE':
      return { ...state, value: amount.value, max: amount.max }
    case 'AMOUNT_PROGRESS_UPDATE':
      return { ...state, value: amount.value, progress: amount.progress }
  }
}
