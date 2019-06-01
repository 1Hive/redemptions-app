import React, { Component } from 'react'
import { Field, TextInput, Button } from '@aragon/ui'

import { isAddress, addressesEqual } from '../../lib/web3-utils'
import { capitalizeFirst } from '../../lib/utils'
import { ErrorMessage, InfoMessage } from './Message'

const validate = (mode, address, tokens) => {
  if (!isAddress(address))
    return 'Token address is not a valid Ethereum address'

  const exists = tokens.some(t => addressesEqual(t.address, address))
  if (mode === 'add' && exists) return 'Token already added to redemption list'

  if (mode === 'remove' && !exists)
    return 'Token is not added to redemption list'

  return null
}

class UpdateTokens extends Component {
  state = {
    address: {
      value: this.props.tokenAddress || '',
      error: null,
    },
  }

  componentDidUpdate({ tokenAddress }, prevState) {
    if (tokenAddress != this.props.tokenAddress) {
      this.setState(({ address }) => ({
        address: { ...address, value: this.props.tokenAddress },
      }))
    }
  }

  handleAddressChange = event => {
    const value = event.target.value
    this.setState(({ address }) => ({
      address: { ...address, value },
    }))
  }

  handleFormSubmit = event => {
    event.preventDefault()

    const { address } = this.state
    const { mode, tokens } = this.props

    const error = validate(mode, address.value, tokens)
    if (error) {
      this.setState(({ address }) => ({
        address: {
          ...address,
          error,
        },
      }))
      return
    }

    this.props.onUpdateTokens(mode, address.value)
  }

  render() {
    const { address } = this.state
    const { mode, tokenSymbol } = this.props

    const errorMessage = address.error

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <InfoMessage
            title={'Redeemption action'}
            text={`This action will ${
              mode === 'add'
                ? 'add token to redemption list'
                : `remove ${tokenSymbol} token from the redemption list`
            }.`}
          />
          <Field label="Token address">
            <TextInput
              name="address"
              wide={true}
              onChange={this.handleAddressChange}
              value={address.value}
              disabled={mode === 'remove'}
            />
          </Field>
          <Button mode="strong" wide={true} type="submit">
            {`${capitalizeFirst(mode)} token`}
          </Button>
          {errorMessage && <ErrorMessage message={errorMessage} />}
        </form>
      </div>
    )
  }
}

export default UpdateTokens
