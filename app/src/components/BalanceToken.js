import React from 'react'
import styled from 'styled-components'
import { breakpoint, IconCross, useTheme } from '@aragon/ui'
import { formatTokenAmount } from '../lib/math-utils'

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
  theme,
}) => (
  <Balance removable={removable} negative={String(theme.negative)}>
    <Top>
      <Token color={String(theme.contentSecondary)}>
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
        <IconCross
          css={{ transform: 'translateX(-3px)' }}
          color={String(theme.negative)}
        />{' '}
        Remove
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
  color: ${({ color }) => color};
  transition: opacity 0.3s ease, transform 0.4s ease;
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
  display: flex;
  align-items: center;
  width: 100px;
  opacity: 0;
  position: absolute;
  top: 20%;
  font-size: 17px;

  transition: opacity 0.3s ease, transform 0.4s ease;
  transform: rotate3d(1, 0, 0, 90deg);

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

  ${({ removable, negative }) =>
    removable &&
    `
    cursor: pointer;
    &:hover {
      ${Top} > ${Remove} {
        transform: rotate3d(0,0,0,0deg);
        opacity: 1;
      }

      ${Top} > ${Token} {
        transform:  rotate3d(1,0,0,90deg);
        opacity: 0;
      }

      ${Bottom} > ${Amount} {
        color: ${negative}
      }
    }

    &:active {
      ${Top} > ${Remove} {
        color: ${negative}
      }
    }
    `}
`

export default props => {
  return <BalanceToken {...props} theme={useTheme()} />
}
