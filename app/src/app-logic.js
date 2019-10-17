import React, { useCallback, useState } from 'react'
import { AragonApi, useAppState, useApi } from '@aragon/api-react'

import { useSidePanel } from './hooks/utils-hooks'
import appStateReducer from './app-state-reducer'
import { MODE } from './mode-types'

export function useMode(requestOpen) {
  const [mode, setMode] = useState(MODE.ADD_TOKEN)
  const [tokenAddress, setTokenAddress] = useState('')

  const updateMode = useCallback(
    (newMode, newTokenAddress = '') => {
      setMode(newMode)
      setTokenAddress(newTokenAddress)
      requestOpen()
    },
    [requestOpen]
  )

  return [{ mode, tokenAddress }, updateMode]
}

export function useRequestActions(request) {
  const addToken = useCallback(() => {
    request(MODE.ADD_TOKEN)
  }, [request])

  const removeToken = useCallback(
    tokenAddress => {
      request(MODE.REMOVE_TOKEN, tokenAddress)
    },
    [request]
  )

  const redeemTokens = useCallback(() => {
    request(MODE.REDEEM_TOKENS)
  }, [request])

  return { addToken, removeToken, redeemTokens }
}

export function useUpdateTokens(mode, onDone) {
  const api = useApi()

  return useCallback(
    address => {
      if (mode === MODE.ADD_TOKEN) api.addRedeemableToken(address).toPromise()
      if (mode === MODE.REMOVE_TOKEN) api.removeRedeemableToken(address).toPromise()
      onDone()
    },
    [api, mode, onDone]
  )
}

export function useRedeemTokens(onDone) {
  const api = useApi()

  return useCallback(
    amount => {
      api.redeem(amount).toPromise()
      onDone()
    },
    [api, onDone]
  )
}

export function useAppLogic() {
  const { isSyncing, burnableToken, tokens = [] } = useAppState()

  const panelState = useSidePanel()
  const [{ mode, tokenAddress }, setMode] = useMode(panelState.requestOpen)

  // Requests to set new mode and open side panel
  const requests = useRequestActions(setMode)

  const actions = {
    updateTokens: useUpdateTokens(mode, panelState.requestClose),
    redeemTokens: useRedeemTokens(panelState.requestClose),
  }

  return {
    actions,
    requests,
    isSyncing,
    burnableToken,
    tokens,
    panelState,
    mode,
    tokenAddress,
  }
}

export function AppLogicProvider({ children }) {
  return <AragonApi reducer={appStateReducer}>{children}</AragonApi>
}
