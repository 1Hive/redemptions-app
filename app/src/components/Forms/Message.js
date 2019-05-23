import React from 'react'
import { Info, Text, IconCross } from '@aragon/ui'
import styled from 'styled-components'

const Message = styled.div`
  margin-top: 1rem;
`

export const InfoMessage = ({ title, text }) => (
  <div style={{ marginBottom: '1rem' }}>
    <Info.Action title={title}>{text}</Info.Action>
  </div>
)

export const ErrorMessage = ({ message }) => (
  <Message>
    <p>
      <IconCross />
      <Text size="small" style={{ marginLeft: '10px' }}>
        {message}
      </Text>
    </p>
  </Message>
)
