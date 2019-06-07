import React, { Component } from 'react'
import styled from 'styled-components'
import { theme, breakpoint, Button, Viewport } from '@aragon/ui'

import BalanceToken from './BalanceToken'

class Balances extends Component {
  render() {
    const { tokens, onAddToken, onRemoveToken } = this.props

    return (
      <Viewport>
        {({ below }) => (
          <section>
            <Title>Tokens for redemption</Title>
            <ScrollView>
              <List>
                {tokens.length > 0 ? (
                  tokens.map(
                    ({ address, name, decimals, amount, symbol, verified }) => (
                      <ListItem
                        key={address}
                        onClick={() => onRemoveToken(address)}
                      >
                        <BalanceToken
                          name={name}
                          symbol={symbol}
                          decimals={decimals}
                          amount={amount}
                          verified={verified}
                          removable={true}
                        />
                      </ListItem>
                    )
                  )
                ) : (
                  <EmptyListItem />
                )}
                {!below('medium') &&
                  AddTokenButton(false, 'outline', onAddToken)}
              </List>
            </ScrollView>

            {below('medium') && (
              <Wrapper>{AddTokenButton(true, 'strong', onAddToken)}</Wrapper>
            )}
          </section>
        )}
      </Viewport>
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
  width: 100%;
  ${breakpoint(
    'medium',
    `
    width: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center
    padding: 0 10px;
 `
  )};
`

const ListItem = styled.li`
  padding: 8px 20px;
  border-bottom: 1px solid ${theme.contentBorder};

  ${breakpoint(
    'medium',
    `
   padding: 25px;
   border: 0;
 `
  )}
`

const AddTokenButton = (wide, mode, onClick) => (
  <Button wide={wide} mode={mode} onClick={onClick}>
    Add Token
  </Button>
)

const Wrapper = styled.div`
  margin: 1rem 1.5rem;
`

export default Balances
