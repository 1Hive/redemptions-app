import React from 'react'
import { Info, IconCross, useTheme, textStyle } from '@aragon/ui'

export const InfoMessage = ({ title, text, background }) => (
  <div style={{ marginBottom: '1rem' }}>
    <Info.Action title={title} background={background}>
      {text}
    </Info.Action>
  </div>
)

export const ErrorMessage = ({ text }) => {
  const theme = useTheme()
  return (
    <div
      css={`
        margin-top: 1rem;
        display: flex;
        align-items: center;
      `}
    >
      <IconCross
        size="tiny"
        css={`
          color: ${theme.negative};
          margin-right: 8px;
        `}
      />
      <span
        css={`
          ${textStyle('body3')}
        `}
      >
        {text}
      </span>
    </div>
  )
}
