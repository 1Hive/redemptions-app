import React, { Component } from 'react'
import { Field, Text, TextInput, Button, Slider } from '@aragon/ui'
import styled from 'styled-components'

import RedeemTokenList from './RedeemTokenList'
import { ErrorMessage, InfoMessage } from './Message'

import { round } from '../../lib/math-utils'

function getTokenExchange(tokens, amount, totalSupply) {
  return tokens.map(t =>
    totalSupply.isZero() ? 0 : amount * t.amount.div(totalSupply)
  )
}

function adjustBalance(balance, decimals) {
  return round(balance / Math.pow(10, decimals))
}

class RedeemTokens extends Component {
  state = {
    amount: {
      value: this.props.balance,
      max: this.props.balance,
      error: '',
    },
    progress: 1,
  }

  //react to account balance changes
  componentDidUpdate(prevProps) {
    if (prevProps.balance != this.props.balance) {
      //recalculate new amount based on same progress and new balance
      this.handleSliderChange(this.state.progress)
    }
  }

  handleAmountChange = event => {
    const { balance } = this.props
    const amount = Math.min(event.target.value, balance)
    const progress = amount / balance

    this.updateAmount(amount, progress)
  }

  handleSliderChange = progress => {
    const { balance } = this.props
    const amount = parseInt(progress * balance)

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

    const {
      amount: { value },
    } = this.state

    this.props.onRedeemTokens(value)
  }

  render() {
    const { amount, progress } = this.state
    const { balance, symbol, totalSupply, tokens } = this.props

    const youGet = getTokenExchange(tokens, amount.value, totalSupply)
    const errorMessage = amount.error

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <InfoMessage
            title={'Redeemption action'}
            text={`You have ${balance} ${symbol} tokens for redemption out of a total of ${totalSupply}. \n This action will redeem ${
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
              min={0}
              onChange={this.handleAmountChange}
            />
            <Text size="large">{symbol}</Text>
          </InputWrapper>
          <RedeemTokenList tokens={tokens} youGet={youGet} />
          {/* <InfoMessage
            text="One you redeem your tokens will be burned"
            background="yellow"
          /> */}
          <Button
            mode="strong"
            wide={true}
            type="submit"
            disabled={amount.value <= 0}
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
