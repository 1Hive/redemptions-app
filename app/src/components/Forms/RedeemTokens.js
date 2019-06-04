import React, { Component } from 'react'
import { Field, Text, TextInput, Button, Slider } from '@aragon/ui'
import styled from 'styled-components'
import BN from 'bn.js'

import RedeemTokenList from './RedeemTokenList'
import { ErrorMessage, InfoMessage } from './Message'

import { fromDecimals, toDecimals, formatTokenAmount } from '../../lib/utils'

function getTokenExchange(tokens, amount, totalSupply) {
  return tokens.map(t =>
    totalSupply === 0 ? 0 : (amount * t.amount) / totalSupply
  )
}

const initialState = {
  amount: {
    value: '',
    max: '',
    error: null,
  },
  progress: 0,
}

class RedeemTokens extends Component {
  state = { ...initialState }

  //react to account balance changes
  componentDidUpdate(prevProps) {
    if (prevProps.balance != this.props.balance) {
      //recalculate new amount based on same progress and new balance
      this.handleSliderChange(this.state.progress)
    }
  }

  handleAmountChange = event => {
    const { balance, decimals } = this.props
    const formattedBalance = fromDecimals(String(balance), decimals)

    const amount = Math.min(event.target.value, formattedBalance)
    const progress = amount / formattedBalance

    this.updateAmount(amount, progress)
  }

  handleSliderChange = progress => {
    const { balance, decimals } = this.props
    const formattedBalance = fromDecimals(String(balance), decimals)

    const amount = Math.round(progress * formattedBalance)

    this.updateAmount(amount, progress)
  }

  updateAmount = (value, progress) => {
    this.setState(({ amount }) => ({
      amount: { ...amount, value },
      progress,
    }))
  }

  handleFormSubmit = event => {
    event.preventDefault()

    const { decimals } = this.props
    const {
      amount: { value },
    } = this.state

    console.log('value', value)
    this.props.onRedeemTokens(toDecimals(String(value), decimals))
  }

  render() {
    const { amount, progress } = this.state
    const { balance, symbol, decimals, totalSupply, tokens } = this.props

    const formattedBalance = formatTokenAmount(balance, false, decimals)
    const formattedSupply = formatTokenAmount(totalSupply, false, decimals)

    const youGet = getTokenExchange(
      tokens,
      amount.value,
      totalSupply / Math.pow(10, decimals)
    )
    const errorMessage = amount.error

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <InfoMessage
            title={'Redeemption action'}
            text={`You have ${formattedBalance} ${symbol} tokens for redemption out of a total of ${formattedSupply}. \n This action will redeem ${
              amount.value
            } tokens`}
          />
          <InputWrapper>
            <SliderWrapper label="Amount to redeem">
              <Slider value={progress} onUpdate={this.handleSliderChange} />
            </SliderWrapper>
            <TextInput.Number
              name="amount"
              wide={true}
              value={amount.value}
              max={amount.max}
              min={'0'}
              step={'1'}
              disabled={amount.max === '0'}
              onChange={this.handleAmountChange}
              required
            />
            <Text size="large">{symbol}</Text>
          </InputWrapper>
          {tokens.length > 0 ? (
            <RedeemTokenList tokens={tokens} youGet={youGet} />
          ) : (
            <Info>No tokens for redemption</Info>
          )}

          {/* <InfoMessage
            text="You'll have to sign a message first for security purposes."
            background={theme.infoPermissionsBackground}
          /> */}
          <Button
            mode="strong"
            wide={true}
            type="submit"
            disabled={amount.value <= 0 || tokens.length === 0}
          >
            {'Redeem tokens'}
          </Button>
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </form>
      </div>
    )
  }
}
export default RedeemTokens

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #eaf6f6;
  padding: 15px 0px;
  > :not(:last-child) {
    margin-right: 15px;
  }
  > :first-child > * {
    background-color: black;
  }
`

const SliderWrapper = styled(Field)`
  label > :nth-child(2) {
    min-width: 200px;
    padding-left: 0;
  }
`

const Info = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
`
