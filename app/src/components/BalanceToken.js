import React from 'react'
import styled from 'styled-components'
import { theme, breakpoint, IconCross } from '@aragon/ui'
import { formatTokenAmount } from '../lib/utils'

const splitAmount = (amount, decimals) => {
  const [integer, fractional] = formatTokenAmount(
    amount,
    false,
    decimals
  ).split('.')
  return (
    <span>
      <span className="integer">{integer}</span>
      {fractional && <span className="fractional">.{fractional}</span>}
    </span>
  )
}

const BalanceToken = ({
  name,
  amount,
  symbol,
  decimals,
  verified,
  removable,
}) => (
  <Balance removable={removable}>
    <Top>
      <Token title={symbol || 'Unknown symbol'}>
        {verified && symbol && (
          <img
            alt=""
            width="16"
            height="16"
            src={`https://chasing-coins.com/coin/logo/${symbol}`}
          />
        )}
        {symbol || '?'}
      </Token>
      <Remove>
        <IconCross /> Remove
      </Remove>
    </Top>
    <Bottom>
      <Amount>{splitAmount(amount, decimals)}</Amount>
    </Bottom>
  </Balance>
)

const Top = styled.div`
  position: relative;
  height: 100%;

  ${breakpoint(
    'medium',
    `
    height: 20px;
    
    `
  )}
`

const Token = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
  font-size: 20px;
  color: ${theme.textSecondary};
  transition: opacity 0.4s ease, transform 0.4s ease;
  height: 100%;
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

const Remove = styled.div`
  width: 100px;
  transform: translateX(1.5rem);
  opacity: 0;
  transition: opacity 0.4s ease, transform 0.4s ease;
  position: absolute;
  top: 20%;
  font-size: 17px;

  ${breakpoint(
    'medium',
    `
      top: 0;
      font-size: 14px;
    `
  )}
`

const Bottom = styled.div`
  text-align: right;

  ${breakpoint(
    'medium',
    `
      text-align: left;
    `
  )};
`

const Amount = styled.div`
  font-size: 26px;
  transition: color 0.4s ease;
  .fractional {
    font-size: 14px;
  }
`

const Balance = styled.div`
  min-width: 75px;
  display: grid;
  grid-template-columns: 1fr 1fr;

  ${breakpoint(
    'medium',
    `
   display: block;
 `
  )}

  ${({ removable }) =>
    removable &&
    `
    cursor: pointer;
    &:hover {
      ${Top} > ${Remove} {
        transform: translateX(0px);
        opacity: 1;
      }

      ${Top} > ${Token} {
        transform: translateX(-1.5rem);
        opacity: 0;
      }

      ${Bottom} > ${Amount} {
        color: ${theme.negative}
      }
    }

    &:active {
      ${Top} > ${Remove} {
        color: ${theme.negative}
      }
    }
    `}
`

const ConvertedAmount = styled.div`
  color: ${theme.textTertiary};
`
export default BalanceToken
