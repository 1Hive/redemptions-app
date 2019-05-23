import React, { Component } from 'react'
import { Info, Field, TextInput, Button } from '@aragon/ui'
import styled from 'styled-components'

import { isAddress } from '../../lib/web3-utils'
import { capitalizeFirst } from '../../lib/utils'

class UpdateTokens extends Component {
  state = {
    address: '',
  }

  handleAddressChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  handleFormSubmit = event => {
    event.preventDefault()

    const { address } = this.state
    const { mode } = this.props
    if (!isAddress(address)) {
      console.log('not address')
      return
    }

    this.props.onUpdateTokens(mode, address)
  }
  render() {
    const { address } = this.state
    const { mode } = this.props
    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <Info.Action title="Redeemption action">
            {`This action will ${
              mode === 'add'
                ? 'add token address to redemption list'
                : 'remove token address from the redemption list'
            }.`}
          </Info.Action>
          <Field label="Token address">
            <TextInput
              name="address"
              wide={true}
              onChange={this.handleAddressChange}
              value={address}
            />
          </Field>
          <Button mode="strong" wide={true} type="submit">
            {`${capitalizeFirst(mode)} token`}
          </Button>
        </form>
      </div>
    )
  }
}

export default UpdateTokens
