import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PersonaForm from '../../components/main/Form/PersonaForm';
import authService from '@/services/auth.service';

// Mockear servicios
vi.mock('@/services/auth.service', () => ({
    default: {
        register: vi.fn(),
    },
}));

// Mockear LoadingModal para simplificar las pruebas (es solo un componente de retroalimentación visual)
vi.mock('@/hooks/Modals/LoadingModal', () => ({
    default: ({ isOpen, message, status }) => (
        isOpen ? <div data-testid="loading-modal">{status}: {message}</div> : null
    ),
}));

describe('PersonaForm', () => {
    const mockOnUserCreated = vi.fn();
    const sedes = [{ id: 1, nombre: 'Sede 1' }, { id: 2, nombre: 'Sede 2' }];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza correctamente para el rol "estudiante"', () => {
        render(
            <PersonaForm role="estudiante" onUserCreated={mockOnUserCreated} />
        );

        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
        // Estudiante no requiere campo de contraseña en este formulario (autogenerado) si no es Encargado
        expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
    });

    it('renderiza correctamente para el rol "encargado"', () => {
        render(
            <PersonaForm role="encargado" onUserCreated={mockOnUserCreated} sedes={sedes} />
        );

        expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/cédula/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sede asignada/i)).toBeInTheDocument();
    });

    it('envía el formulario exitosamente', async () => {
        authService.register.mockResolvedValue({ data: { message: 'Success' } });

        render(
            <PersonaForm role="estudiante" onUserCreated={mockOnUserCreated} />
        );

        // Completar el formulario
        fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'John' } });
        fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByRole('textbox', { name: /cédula/i }), { target: { value: '123456' } }); // Usar spinbutton para input numérico dentro de MUI

        // Enviar
        fireEvent.click(screen.getByRole('button', { name: /crear estudiante/i }));

        // Verificar estado de carga
        expect(screen.getByTestId('loading-modal')).toHaveTextContent('loading: Creando estudiante...');

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalledTimes(1);
        });

        expect(authService.register).toHaveBeenCalledWith('estudiante', expect.objectContaining({
            nombre: 'John',
            apellido: 'Doe',
            ci: 123456,
        }));

        // Verificar mensaje de éxito del modal
        await waitFor(() => {
            expect(screen.getByTestId('loading-modal')).toHaveTextContent('success: Estudiante creado correctamente.');
        });

        // Verificar callback
        expect(mockOnUserCreated).toHaveBeenCalled();
    });

    it('maneja error de envío', async () => {
        const errorMessage = 'Error creating user';
        authService.register.mockRejectedValue({ response: { data: { error: errorMessage } } });

        render(
            <PersonaForm role="estudiante" onUserCreated={mockOnUserCreated} />
        );

        fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByRole('textbox', { name: /cédula/i }), { target: { value: '654321' } });

        fireEvent.click(screen.getByRole('button', { name: /crear estudiante/i }));

        await waitFor(() => {
            expect(screen.getByTestId('loading-modal')).toHaveTextContent(`error: ${errorMessage}`);
        });

        expect(mockOnUserCreated).not.toHaveBeenCalled();
    });
});
