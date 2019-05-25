import React from 'react'
import { Text } from '@aragon/ui'
import styled from 'styled-components'

import BalanceToken from '../BalanceToken'

export default function RedeemTokenList(props) {
  const { tokens, youGet } = props
  return (
    <Wrap>
      <Text style={{ marginBottom: '15px', display: 'block' }} size="xl">
        Amounts you will redeem from vault
      </Text>
      <List>
        {tokens.map((t, index) => {
          return (
            <ListItem key={index}>
              <BalanceToken
                name={t.name}
                symbol={t.symbol}
                amount={youGet[index]}
                verified={t.verified}
              />
            </ListItem>
          )
        })}
      </List>
    </Wrap>
  )
}

const Wrap = styled.div`
  margin-bottom: 30px;
`

const List = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 15px;
  row-gap: 15px;
`

const ListItem = styled.li`
  box-shadow: 0px 0px 3px 0px rgb(36, 173, 169, 0.25);
  padding: 5px 15px;
`
