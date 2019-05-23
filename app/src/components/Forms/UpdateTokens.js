import React, { Component } from 'react'
import { Field, TextInput, Button } from '@aragon/ui'

import { isAddress, addressesEqual } from '../../lib/web3-utils'
import { capitalizeFirst } from '../../lib/utils'

import { ErrorMessage, InfoMessage } from './Message'

class UpdateTokens extends Component {
  state = {
    address: {
      value: '',
      error: '',
    },
  }

  handleAddressChange = event => {
    const value = event.target.value
    this.setState(({ address }) => ({
      address: { ...address, value },
    }))
  }

  handleFormSubmit = event => {
    event.preventDefault()

    const {
      address: { value },
    } = this.state
    const { mode, tokens } = this.props

    let error = null
    if (!isAddress(value))
      error = 'Tokens address is not a valid Ethereum address'
    else if (tokens.some(t => addressesEqual(t.address, value)))
      error = 'Token already added to redemption List'

    if (error) {
      this.setState(({ address }) => ({
        address: {
          ...address,
          error,
        },
      }))
      return
    }

    this.props.onUpdateTokens(mode, value)
  }

  render() {
    const { address } = this.state
    const { mode } = this.props

    const errorMessage = address.error

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <InfoMessage
            title={'Redeemption action'}
            text={`This action will ${
              mode === 'add'
                ? 'add token to redemption list'
                : 'remove token from the redemption list'
            }.`}
          />
          <Field label="Token address">
            <TextInput
              name="address"
              wide={true}
              onChange={this.handleAddressChange}
              value={address.value}
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
