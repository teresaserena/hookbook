import { cleanup, render, type RenderOptions } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Provider } from './components/ui/provider'
import React from 'react'

afterEach(() => {
  cleanup()
})

function renderWithProvider(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, {
    wrapper: ({ children }) => <Provider>{children}</Provider>,
    ...options,
  })
}

export { renderWithProvider as render }
export { screen, within } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
