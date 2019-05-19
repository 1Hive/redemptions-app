import React from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, SidePanel } from '@aragon/ui'

import Balances from './components/Balances'

import AppLayout from './components/AppLayout'
//test

class App extends React.Component {
  static propTypes = {
    api: PropTypes.object,
    appState: PropTypes.object,
  }

  state = {
    redeemOpen: false,
  }

  handleRedeemOpen = () => {
    this.setState({ redeemOpen: true })
  }

  handleRedeemClose = () => {
    this.setState({ redeemOpen: false })
  }

  render() {
    const { appState } = this.props
    const { redeemOpen } = this.state
    const { addedTokens } = appState

    console.log('state', appState)

    return (
      <Main>
        <AppLayout
          title="Redemptions"
          mainButton={{
            label: 'Redeem',
            onClick: this.handleRedeemOpen,
            icon: '',
          }}
          smallViewPadding={0}
        >
          {addedTokens && <Balances addedTokens={addedTokens} />}
        </AppLayout>
        <SidePanel
          opened={redeemOpen}
          onClose={this.handleRedeemClose}
          title="Redeem"
        />
      </Main>
    )
  }
}

export default () => {
  const { api, appState } = useAragonApi()
  return <App api={api} appState={appState} />
}
