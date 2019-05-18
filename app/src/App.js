import React from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import { Main, SidePanel } from '@aragon/ui'

import AppLayout from './components/AppLayout'
//test

class App extends React.Component {
  static propTypes = {
    api: PropTypes.object,
    appState: PropTypes.object,
  }

  state = {
    addTokenOpen: false
  }

  handleAddTokenOpen = () => {
    this.setState({ addTokenOpen:true })
  }

  handleAddTokenClose = () => {
    this.setState({ addTokenOpen:false })
  }

  render() {
    const { appState } = this.props
    const { addTokenOpen } = this.state

    return (
      <Main>
        <AppLayout 
          title="Redemptions"
          mainButton={{
            label: 'Add Token',
            onClick: this.handleAddTokenOpen,
            icon: ''
          }}
          smallViewPadding={0}
        >
        </AppLayout>
        <SidePanel
            opened={addTokenOpen}
            onClose={this.handleAddTokenClose}
            title="Add token"
        >
  
        </SidePanel>
      </Main>
    )
  }
}

export default () => {
  const { api, appState } = useAragonApi()
  return <App api={api} appState={appState}/>
}
