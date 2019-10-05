import React from 'react'
import PropTypes from 'prop-types'
import { useAppState, useApi } from '@aragon/api-react'
import { Main, Badge, SidePanel, SyncIndicator, Header, GU } from '@aragon/ui'
import { capitalizeFirst } from './lib/utils'

import redeemIcon from './assets/icono.svg'
import Title from './components/Title'
import MainButton from './components/Buttons/MainButton'
import Balances from './components/Balances'
import NoTokens from './screens/NoTokens'
import UpdateTokens from './components/Panels/UpdateTokens'
import RedeemTokens from './components/Panels/RedeemTokens'

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
    this.handleLaunchToken('add', '')
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
    if (mode === 'add') api.addRedeemableToken(address).toPromise()
    if (mode === 'remove') api.removeRedeemableToken(address).toPromise()

    this.handleSidePanelClose()
  }

  handleRedeemTokens = async amount => {
    const { api } = this.props

    api.redeem(amount).toPromise()

    this.handleSidePanelClose()
  }

  render() {
    const { tokens, redeemableToken: rdt, isSyncing, api } = this.props
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
        <SyncIndicator visible={isSyncing} />
        <Header
          primary={
            showTokens ? (
              <Title
                text="Redememptions"
                after={rdt && <Badge.App>{rdt.symbol}</Badge.App>}
              />
            ) : null
          }
          secondary={
            showTokens ? (
              <MainButton
                label="Redeem"
                onClick={this.handleLaunchRedeemTokens}
                icon={<img src={redeemIcon} height="30px" alt="" />}
              />
            ) : null
          }
        />
        {showTokens ? (
          <Balances
            tokens={tokens}
            onAddToken={this.handleLaunchAddToken}
            onRemoveToken={this.handleLaunchRemoveToken}
          />
        ) : (
          !isSyncing && (
            <div
              css={`
                height: calc(100vh - ${8 * GU}px);
                display: flex;
                align-items: center;
                justify-content: center;
              `}
            >
              <NoTokens
                onNewToken={this.handleLaunchAddToken}
                isSyncing={isSyncing}
              />
            </div>
          )
        )}
        <SidePanel {...sidePanelProps}>
          <div
            css={`
              margin-top: ${3 * GU}px;
            `}
          >
            {mode === 'redeem' ? (
              <RedeemTokens
                appi={api}
                balance={rdt.balance}
                symbol={rdt.symbol}
                decimals={rdt.numData.decimals}
                totalSupply={rdt.totalSupply}
                tokens={redeemables}
                onRedeemTokens={this.handleRedeemTokens}
                opened={sidePanelProps.opened}
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
          </div>
        </SidePanel>
      </Main>
    )
  }
}

export default () => {
  const api = useApi()
  const appState = useAppState()
  return <App api={api} {...appState} />
}
