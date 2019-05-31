import React, { Component } from 'react'
import styled from 'styled-components'
import { theme, breakpoint, Button, SidePanel } from '@aragon/ui'

import BalanceToken from './BalanceToken'

class Balances extends Component {
  render() {
    const { tokens, onAddToken, onRemoveToken } = this.props

    return (
      <React.Fragment>
        <section>
          <Title>Tokens for redemption</Title>
          <ScrollView>
            <List>
              {tokens.length > 0 ? (
                tokens.map(
                  ({ address, name, decimals, amount, symbol, verified }) => (
                    <ListItem key={address}>
                      <BalanceToken
                        name={name}
                        symbol={symbol}
                        decimals={decimals}
                        amount={amount}
                        verified={verified}
                      />
                    </ListItem>
                  )
                )
              ) : (
                <EmptyListItem />
              )}
            </List>
            <Button mode="outline" onClick={onAddToken}>
              Add Token
            </Button>
          </ScrollView>
        </section>
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
