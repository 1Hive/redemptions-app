import React, { Component } from 'react'
import styled from 'styled-components'
import { theme, breakpoint, Button, SidePanel } from '@aragon/ui'

import BalanceToken from './BalanceToken'

class Balances extends Component {
  state = {
    addTokenOpen: false,
  }

  handleAddTokenOpen = () => {
    this.setState({ addTokenOpen: true })
  }

  handleAddTokenClose = () => {
    this.setState({ addTokenOpen: false })
  }

  render() {
    const { addedTokens } = this.props
    const { addTokenOpen } = this.state

    return (
      <React.Fragment>
        <section>
          <Title>Vault tokens</Title>
          <ScrollView>
            <List>
              {addedTokens.length > 0 ? (
                addedTokens.map(({ address, name, amount, symbol }) => (
                  <ListItem key={address}>
                    <BalanceToken amount={amount} name={name} symbol={symbol} />
                  </ListItem>
                ))
              ) : (
                <EmptyListItem />
              )}
            </List>
            <Button mode="strong" onClick={() => this.handleAddTokenOpen()}>
              Add Token
            </Button>
          </ScrollView>
        </section>
        <SidePanel
          opened={addTokenOpen}
          onClose={this.handleAddTokenClose}
          title="Add token"
        />
      </React.Fragment>
    )
  }
}

const EmptyListItem = () => (
  <ListItem style={{ opacity: '0' }}>
    <BalanceToken amount={0} convertedAmount={0} />
  </ListItem>
)

const ScrollView = styled.div`
  /*
* translate3d() fixes an issue on recent Firefox versions where the
* scrollbar would briefly appear on top of everything (including the
* sidepanel overlay).
*/
  display: flex;
  align-items: center;
  transform: translate3d(0, 0, 0);
  overflow-x: auto;
  background: ${theme.contentBackground};
  border-top: 1px solid ${theme.contentBorder};

  ${breakpoint(
    'medium',
    `
   border: 1px solid ${theme.contentBorder};
   border-radius: 3px;
 `
  )};
`

const Title = styled.h1`
  margin: 20px 0 20px 20px;
  font-weight: 600;

  ${breakpoint(
    'medium',
    `
   margin: 10px 30px 20px 0;
 `
  )};
`

const List = styled.ul`
  list-style: none;

  ${breakpoint(
    'medium',
    `
   display: flex;
   padding: 0 10px;
 `
  )};
`

const ListItem = styled.li`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 8px 20px;
  border-bottom: 1px solid ${theme.contentBorder};

  ${breakpoint(
    'medium',
    `
   display: block;
   padding: 25px;
   border: 0;
 `
  )};
`

export default Balances
