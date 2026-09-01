import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button, TextField } from './index'

describe('Design System primitives', () => {
  it('supports keyboard activation and disabled behavior for Button', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<><Button onClick={onClick}>Ativar</Button><Button disabled>Desativado</Button></>)

    const active = screen.getByRole('button', { name: 'Ativar' })
    await user.click(active)
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Desativado' })).toBeDisabled()
  })

  it('associates label, description and error with TextField', () => {
    render(<TextField id="email" label="Email" description="Usado para contacto." error="Email inválido." />)
    const field = screen.getByLabelText('Email')
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field.getAttribute('aria-describedby')).toContain('email-description')
    expect(field.getAttribute('aria-describedby')).toContain('email-error')
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido.')
  })
})
