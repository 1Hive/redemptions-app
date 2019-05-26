import React from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, SidePanel } from '@aragon/ui'

import { capitalizeFirst } from './lib/utils'

import Balances from './components/Balances'
import AppLayout from './components/AppLayout'
import EmptyState from './screens/EmptyState'
import UpdateTokens from './components/Forms/UpdateTokens'
import RedeemTokens from './components/Forms/RedeemTokens'

class App extends React.Component {
  static propTypes = {
    api: PropTypes.object,
    appState: PropTypes.object,
  }

  state = {
    sidePanelOpened: false,
    mode: 'add',
  }

  handleLaunchAddToken = () => {
    this.setState({
      sidePanelOpened: true,
      mode: 'add',
    })
  }

  handleLaunchRemoveToken = () => {
    this.setState({
      sidePanelOpened: true,
      mode: 'remove',
    })
  }

  handleLaunchRedeemTokens = () => {
    this.setState({
      sidePanelOpened: true,
      mode: 'redeem',
    })
  }

  handleSidePanelClose = () => {
    this.setState({ sidePanelOpened: false })
  }

  handleUpdateTokens = (mode, address) => {
    const { api } = this.props

    if (mode === 'add') api.addToken(address)
    if (mode === 'remove') api.removeToken(address)

    this.handleSidePanelClose()
  }

  handleRedeemTokens = () => {}

  render() {
    const { appState } = this.props
    const { tokens } = appState
    const { mode, sidePanelOpened } = this.state

    const sidePanelProps = {
      opened: sidePanelOpened,
      onClose: this.handleSidePanelClose,
      title:
        mode === 'redeem'
          ? capitalizeFirst(mode)
          : `${capitalizeFirst(mode)} token`,
    }
    const showTokens = tokens && tokens.length > 0
    console.log('state', appState)

    return (
      <Main>
        <AppLayout
          title="Redemptions"
          mainButton={
            showTokens
              ? {
                  label: 'Redeem',
                  onClick: this.handleLaunchRedeemTokens,
                  icon: '',
                }
              : null
          }
          smallViewPadding={0}
        >
          {showTokens ? (
            <Balances
              tokens={tokens}
              onAddToken={this.handleLaunchAddToken}
              onRemoveToken={this.handleLaunchRemoveToken}
            />
          ) : (
            <EmptyState onActivate={this.handleLaunchAddToken} />
          )}
        </AppLayout>
        <SidePanel {...sidePanelProps}>
          {mode === 'redeem' ? (
            <RedeemTokens onRedeemTokens={this.handleRedeemTokens} />
          ) : (
            <UpdateTokens
              onUpdateTokens={this.handleUpdateTokens}
              mode={mode}
            />
          )}
        </SidePanel>
      </Main>
    )
  }
}

export default () => {
  const { api, appState } = useAragonApi()
  return <App api={api} appState={appState} />
}
