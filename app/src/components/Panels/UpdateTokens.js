import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Field, TextInput, Button, TokenBadge } from '@aragon/ui'

import { isAddress, addressesEqual } from '../../lib/web3-utils'
import { ErrorMessage, InfoMessage } from '../Message'
import { MODE, getModeTag } from '../../mode-types'

const UpdateTokens = React.memo(
  ({ mode, tokens, tokenAddress, onUpdateTokens, panelVisible, panelOpened }) => {
    const inputRef = useRef(null)
    const [address, setAddress, error, setError] = useAddress(tokenAddress, panelVisible)

    /* Panel opens =>  Focus input
     **/
    useEffect(() => {
      if (panelOpened) {
        mode === MODE.ADD_TOKEN && inputRef.current.focus()
      }
    }, [panelOpened])

    const handleFormSubmit = event => {
      event.preventDefault()

      const error = validate(mode, address, tokens)
      if (error) {
        setError(error)
        return
      }

      onUpdateTokens(address)
    }

    const { name, symbol } = useMemo(() => {
      return mode === MODE.REMOVE_TOKEN && address
        ? tokens.find(t => addressesEqual(t.address, address))
        : {}
    }, [address, tokens])

    return (
      <div>
        <form onSubmit={handleFormSubmit}>
          <InfoMessage
            title="Redemption action"
            text={`This action will ${
              mode === MODE.ADD_TOKEN
                ? 'add a token to redemption list'
                : `remove ${symbol && symbol} token from the redemption list`
            }.`}
          />
          <Field label="Token address">
            {mode === MODE.ADD_TOKEN ? (
              <TextInput
                name="address"
                wide={true}
                onChange={setAddress}
                value={address}
                ref={inputRef}
              />
            ) : (
              address && <TokenBadge address={address} name={name} symbol={symbol} />
            )}
          </Field>
          <Button mode="strong" wide={true} type="submit">
            {getModeTag(mode)}
          </Button>
          {error && <ErrorMessage message={error} />}
        </form>
      </div>
    )
  }
)

const validate = (mode, address, tokens) => {
  if (!isAddress(address)) return 'Token address is not a valid Ethereum address'

  const exists = tokens.some(t => addressesEqual(t.address, address))
  if (mode === MODE.ADD_TOKEN && exists) return 'Token already added to redemption list'

  if (mode === MODE.REMOVE_TOKEN && !exists)
    return 'Token is not added to redemption list'

  return null
}

const useAddress = (tokenAddress, panelVisible) => {
  const [address, setAddress] = useState('')
  const [error, setError] = useState('')

  const handleAddressChange = event => {
    setAddress(event.target.value)
  }

  useEffect(() => {
    if (panelVisible) setAddress(tokenAddress)
  }, [tokenAddress, panelVisible])

  /* Panel closes => Reset address and error state
   **/
  useEffect(() => {
    if (!panelVisible) {
      setAddress('')
      setError('')
    }
  }, [panelVisible])

  return [address, handleAddressChange, error, setError]
}

export default UpdateTokens
