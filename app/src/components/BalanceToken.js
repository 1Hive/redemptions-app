import React from 'react'
import styled from 'styled-components'
import { theme, breakpoint } from '@aragon/ui'

const BalanceToken = ({ name, amount, symbol }) => (
  <React.Fragment>
    <Token title={symbol || 'Unknown symbol'}>
      {/* {verified && symbol && (
        <img
          alt=""
          width="16"
          height="16"
          src={`https://chasing-coins.com/coin/logo/${symbol}`}
        />
      )} */}
      {symbol || '?'}
    </Token>
    <Wrap>
      <Amount>{amount}</Amount>
      <ConvertedAmount>
        {/* {convertedAmount >= 0
          ? `$${formatTokenAmount(convertedAmount.toFixed(2))}`
          : '−'} */}
      </ConvertedAmount>
    </Wrap>
  </React.Fragment>
)

const Wrap = styled.div`
  text-align: right;

  ${breakpoint(
    'medium',
    `
      text-align: left;
    `
  )};
`

const Token = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 28px;
  color: ${theme.textSecondary};
  img {
    margin-right: 10px;
  }

  ${breakpoint(
    'medium',
    `
      font-size: 14px;
    `
  )}
`

const Amount = styled.div`
  font-size: 26px;
  .fractional {
    font-size: 14px;
  }
`

const ConvertedAmount = styled.div`
  color: ${theme.textTertiary};
`
export default BalanceToken
