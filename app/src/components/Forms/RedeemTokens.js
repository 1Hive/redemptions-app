import React, { Component } from 'react'
import { Field, Text, TextInput, Button, Slider } from '@aragon/ui'
import styled from 'styled-components'

import RedeemTokenList from './RedeemTokenList'
import { ErrorMessage, InfoMessage } from './Message'

class RedeemTokens extends Component {
  state = {
    amount: {
      value: this.props.balance,
      error: '',
    },
    progress: 1,
  }

  getTokenExchange(amount, totalSupply, tokens) {
    return tokens.map(t => parseInt((amount * t.amount) / totalSupply))
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
    const { balance, totalSupply, tokens } = this.props

    const youGet = this.getTokenExchange(amount.value, totalSupply, tokens)
    const errorMessage = amount.error

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <InfoMessage
            title={'Redeemption action'}
            text={`This action will redeem ${amount.value} tokens`}
          />
          <Text size="large">{`You have ${balance} {symbol} tokens for redemption out of a total of ${totalSupply}`}</Text>
          <SliderField>
            <Field label="Amount to redeem">
              <Slider value={progress} onUpdate={this.handleSliderChange} />
            </Field>
            <TextInput.Number
              name="amount"
              wide={true}
              value={amount.value}
              max={balance}
              min={0}
              onChange={this.handleAmountChange}
            />
          </SliderField>
          <RedeemTokenList tokens={tokens} youGet={youGet} />
          <Button mode="strong" wide={true} type="submit">
            {'Redeem tokens'}
          </Button>
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </form>
      </div>
    )
  }
}
export default RedeemTokens

const SliderField = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`
