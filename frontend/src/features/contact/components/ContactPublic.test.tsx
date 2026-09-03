import { MemoryRouter } from 'react-router-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../api/client/errors'
import { ContactForm } from './ContactPublic'

const validProps = { isPending: false, isSuccess: false, error: undefined }

function renderForm(props: Partial<React.ComponentProps<typeof ContactForm>> = {}) {
  return render(<MemoryRouter><ContactForm submitRequest={vi.fn().mockResolvedValue({ id: 'request' })} {...validProps} {...props} /></MemoryRouter>)
}

describe('public contact form', () => {
  it('renders field validation errors before submission', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(screen.getAllByRole('button', { name: /Enviar pedido/ })[0])
    expect(await screen.findByText('Indique o primeiro nome.')).toBeInTheDocument()
    expect(screen.getByText('Indique o apelido.')).toBeInTheDocument()
    expect(screen.getByText('Indique um email válido.')).toBeInTheDocument()
  })

  it('submits the verified RequestInput shape and renders success', async () => {
    const user = userEvent.setup()
    const submitRequest = vi.fn().mockResolvedValue({ id: 'request' })
    render(<MemoryRouter><ContactForm submitRequest={submitRequest} {...validProps} /></MemoryRouter>)
    await user.type(screen.getByLabelText(/Nome/ ), 'Ana')
    await user.type(screen.getByLabelText(/Apelido/ ), 'Silva')
    await user.type(screen.getByLabelText(/Email/ ), 'ana@example.com')
    await user.selectOptions(screen.getByRole('combobox', { name: /Tipo de pedido/ }), 'GENERAL')
    expect(screen.getByLabelText(/Nome/ )).toHaveValue('Ana')
    expect(screen.getByLabelText(/Apelido/ )).toHaveValue('Silva')
    expect(screen.getByLabelText(/Email/ )).toHaveValue('ana@example.com')
    expect(screen.getByRole('combobox', { name: /Tipo de pedido/ })).toHaveValue('GENERAL')
    await user.tab()
    fireEvent.submit(screen.getAllByRole('button', { name: /Enviar pedido/ })[0].closest('form') as HTMLFormElement)
    await waitFor(() => expect(submitRequest).toHaveBeenCalledWith(expect.objectContaining({ firstName: 'Ana', lastName: 'Silva', email: 'ana@example.com', type: 'GENERAL' })))
  })

  it('disables both submit actions while the request is pending', () => {
    renderForm({ isPending: true })
    screen.getAllByRole('button', { name: /Enviar pedido/ }).forEach((button) => expect(button).toBeDisabled())
  })

  it('renders a typed API error without inventing a response promise', () => {
    renderForm({ error: new ApiError('Serviço indisponível.', { code: 'INTERNAL_ERROR' }) })
    expect(screen.getByText('Serviço indisponível.')).toBeInTheDocument()
  })

  it('renders a safe generic error for an unexpected non-API failure', () => {
    renderForm({ error: new Error('socket detail that must not be exposed') })
    expect(screen.getByRole('heading', { name: 'Não foi possível enviar o pedido.' })).toBeInTheDocument()
    expect(screen.queryByText('socket detail that must not be exposed')).not.toBeInTheDocument()
  })

  it('renders backend validation state and maps field errors to the form', async () => {
    renderForm({
      error: new ApiError('Validation failed', {
        code: 'VALIDATION_FAILED',
        fieldErrors: { email: ['O email não foi aceite.'] },
      }),
    })

    expect(screen.getByText('Verifique os dados.')).toBeInTheDocument()
    expect(await screen.findByText('O email não foi aceite.')).toBeInTheDocument()
  })
})
