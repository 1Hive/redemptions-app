import React from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, Badge, SidePanel } from '@aragon/ui'
import { capitalizeFirst } from './lib/utils'
import { getSignatureFields, soliditySha3 } from './lib/web3-utils'

import redeemIcon from './assets/icono.svg'
import Balances from './components/Balances'
import AppLayout from './components/AppLayout'
import EmptyState from './screens/EmptyState'
import UpdateTokens from './components/Forms/UpdateTokens'
import RedeemTokens from './components/Forms/RedeemTokens'

const hashMessage = soliditySha3('I WOULD LIKE TO REDEEM SOME TOKENS PLEASE')

class App extends React.Component {
  static propTypes = {
    api: PropTypes.object,
    appState: PropTypes.object,
  }

  state = {
    sidePanelOpened: false,
    mode: 'add',
    tokenAddress: '',
  }

  handleLaunchAddToken = () => {
    this.handleLaunchToken('add', '', '')
  }

  handleLaunchRemoveToken = address => {
    this.handleLaunchToken('remove', address)
  }

  handleLaunchToken = (mode, tokenAddress) => {
    this.setState({
      sidePanelOpened: true,
      mode,
      tokenAddress,
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

  handleRedeemTokens = async amount => {
    const { api } = this.props

    api.requestSignMessage(hashMessage).subscribe(
      signature => {
        const signFields = Object.values(getSignatureFields(signature))
        api.redeem(amount, hashMessage, ...signFields)
      },
      err => {
        console.log(err)
      }
    )

    this.handleSidePanelClose()
  }

  render() {
    const { appState } = this.props
    const { tokens, redeemableToken: rdt } = appState
    const { mode, sidePanelOpened, tokenAddress } = this.state

    const modeStr = capitalizeFirst(mode)
    const sidePanelProps = {
      opened: sidePanelOpened,
      onClose: this.handleSidePanelClose,
      title: mode === 'redeem' ? modeStr : `${modeStr} token`,
    }

    const showTokens = tokens && tokens.length > 0
    //show only tokens that are going to be redeemed
    const redeemables = showTokens ? tokens.filter(t => !t.amount.isZero()) : []

    return (
      <Main>
        <AppLayout
          title="Redemptions"
          afterTitle={rdt && <Badge.App>{rdt.symbol}</Badge.App>}
          mainButton={
            showTokens
              ? {
                  label: 'Redeem',
                  onClick: this.handleLaunchRedeemTokens,
                  icon: <img src={redeemIcon} height="30px" alt="" />,
                }
              : null
          }
          smallViewPadding={0}
        >
          {showTokens ? (
            <Balances tokens={tokens} onAddToken={this.handleLaunchAddToken} onRemoveToken={this.handleLaunchRemoveToken} />
          ) : (
            <EmptyState onActivate={this.handleLaunchAddToken} />
          )}
        </AppLayout>
        <SidePanel {...sidePanelProps}>
          {mode === 'redeem' ? (
            <RedeemTokens
              balance={rdt.balance}
              symbol={rdt.symbol}
              decimals={rdt.numData.decimals}
              totalSupply={rdt.totalSupply}
              tokens={redeemables}
              onRedeemTokens={this.handleRedeemTokens}
            />
          ) : (
            <UpdateTokens
              mode={mode}
              tokens={tokens}
              tokenAddress={tokenAddress}
              onUpdateTokens={this.handleUpdateTokens}
              opened={sidePanelProps.opened}
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
