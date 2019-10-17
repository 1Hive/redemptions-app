import React, { useCallback, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'

import { Text, TextInput, Button, Slider, breakpoint, Field } from '@aragon/ui'
import RedeemTokenList from '../RedeemTokenList'
import { InfoMessage } from '../Message'

import {
  formatTokenAmount,
  toDecimals,
  safeDiv,
  fromDecimals,
  round,
} from '../../lib/math-utils'

const MAX_INPUT_DECIMAL_BASE = 6

/** HELPERS */
function getTokenExchange(tokens, amount, totalSupply) {
  return tokens.map(t => safeDiv(amount * t.amount, totalSupply))
}

function formatAmount(amount, decimals) {
  const rounding = Math.min(MAX_INPUT_DECIMAL_BASE, decimals)
  return formatTokenAmount(amount, false, decimals, false, { rounding })
}

const RedeemTokens = ({
  balance,
  symbol,
  decimals,
  totalSupply,
  tokens,
  onRedeemTokens,
  panelOpened,
}) => {
  // Get metrics
  const rounding = Math.min(MAX_INPUT_DECIMAL_BASE, decimals)
  const minTokenStep = fromDecimals('1', Math.min(MAX_INPUT_DECIMAL_BASE, decimals))

  // Format BN
  const formattedBalance = formatAmount(balance, decimals)
  const formattedSupply = formatAmount(totalSupply, decimals)

  // Use state
  const [amount, setAmount, progress, setProgress] = useAmount(formattedBalance, rounding)

  // Focus input
  const inputRef = useRef(null)
  useEffect(() => {
    if (panelOpened) {
      inputRef.current.focus()
    }
  }, [panelOpened])

  const handleFormSubmit = event => {
    event.preventDefault()

    onRedeemTokens(toDecimals(amount.value, decimals))
  }

  // Filter tokens with 0 balance and get exchange
  const tokensWithBalance = tokens ? tokens.filter(t => !t.amount.isZero()) : []
  const youGet = getTokenExchange(
    tokensWithBalance,
    amount.value,
    totalSupply / Math.pow(10, decimals)
  )

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <InfoMessage
          title={'Redemption action'}
          text={`This action will burn ${amount.value} ${symbol} tokens in exchange for redeemable tokens`}
        />
        <TokenInfo>
          You have{' '}
          <Text weight="bold">
            {formattedBalance} out of a total of {formattedSupply} {symbol}{' '}
          </Text>{' '}
          tokens for redemption
        </TokenInfo>
        <Wrapper>
          <SliderWrapper label="Amount to burn">
            <Slider value={progress} onUpdate={setProgress} />
          </SliderWrapper>
          <InputWrapper>
            <TextInput
              type="number"
              name="amount"
              wide={false}
              value={amount.value}
              max={amount.max}
              min={'0'}
              step={minTokenStep}
              onChange={setAmount}
              required
              ref={inputRef}
            />
            <Text size="large">{symbol}</Text>
          </InputWrapper>
        </Wrapper>
        {tokensWithBalance.length > 0 ? (
          <RedeemTokenList tokens={tokensWithBalance} youGet={youGet} />
        ) : (
          <Info>No tokens to redeem</Info>
        )}

        <Button
          mode="strong"
          wide={true}
          type="submit"
          disabled={amount.value <= 0 || tokensWithBalance.length === 0}
        >
          {'Redeem tokens'}
        </Button>
      </form>
    </div>
  )
}

/** CUSTOM HOOK */
const useAmount = (balance, rounding) => {
  const [amount, setAmount] = useState({
    value: balance,
    max: balance,
  })
  const [progress, setProgress] = useState(1)

  // If balance changes => Update max balance && Update amount based on progress
  useEffect(() => {
    const value = round(progress * balance, rounding)

    setAmount({ ...amount, value: String(value), max: balance })
  }, [balance, rounding])

  // Change amount handler
  const handleAmountChange = useCallback(
    event => {
      const newValue = Math.min(event.target.value, balance)
      const progress = safeDiv(newValue, balance)

      setAmount({ ...amount, value: String(newValue) })
      setProgress(progress)
    },
    [balance]
  )

  // Change progress handler
  const handleSliderChange = useCallback(
    newProgress => {
      const newValue = round(newProgress * balance, rounding)

      setAmount({ ...amount, value: String(newValue) })
      setProgress(newProgress)
    },
    [balance, rounding]
  )

  return [amount, handleAmountChange, progress, handleSliderChange]
}

export default RedeemTokens

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eaf6f6;
  border-top: 1px solid #eaf6f6;
  padding: 20px 0px;
`

const SliderWrapper = styled(Field)`
  flex-basis: 50%;
  > :first-child > :nth-child(2) {
    min-width: 150px;
    padding-left: 0;
    ${breakpoint(
      'medium',
      `
     min-width: 200px;
   `
    )}
  }
`
const InputWrapper = styled.div`
  flex-basis: 50%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;

  > :first-child {
    width: 75%;
  }
`

const Info = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`

const TokenInfo = styled.div`
  padding: 20px 0;
`
