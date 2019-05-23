import React from 'react'
import styled from 'styled-components'

export default function RedeemTokenList(props) {
  const { tokens, youGet } = props
  return (
    <div>
      <List>
        {tokens.map((t, index) => {
          return (
            <ListItem key={index}>
              {t.symbol} - {youGet[index]}
            </ListItem>
          )
        })}
      </List>
    </div>
  )
}

const List = styled.ul`
  list-style: none;
`

const ListItem = styled.li``
