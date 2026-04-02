import React from 'react'
import type { Preview } from '@storybook/react-vite'
import { Provider } from '../client/components/ui/provider'

const preview: Preview = {
  decorators: [
    (Story) => (
      <Provider>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
}

export default preview
