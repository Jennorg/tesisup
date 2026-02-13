import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ManagementForm from '../../components/main/Form/ManagementForm';
import userService from '@/services/user.service';

// Servicios Mock
vi.mock('@/services/user.service', () => ({
    default: {
        getProfesores: vi.fn(),
        getEncargados: vi.fn(),
        getSedes: vi.fn(),
        getEstudiantes: vi.fn(),
    },
}));

// Componentes hijos Mock
vi.mock('../../components/main/Form/tesisForm.jsx', () => ({
    default: () => <div data-testid="tesis-form">Tesis Form</div>,
}));

vi.mock('../../components/main/Form/PersonaForm.jsx', () => ({
    default: ({ role }) => <div data-testid={`persona-form-${role}`}>Persona Form: {role}</div>,
}));

describe('ManagementForm', () => {
    const mockOptions = { data: [] };

    beforeEach(() => {
        vi.clearAllMocks();
        userService.getProfesores.mockResolvedValue(mockOptions);
        userService.getEncargados.mockResolvedValue(mockOptions);
        userService.getSedes.mockResolvedValue(mockOptions);
        userService.getEstudiantes.mockResolvedValue(mockOptions);
    });

    it('renderiza pestañas y predetermina la pestaña Tesis', async () => {
        render(<ManagementForm />);

        expect(screen.getByRole('tab', { name: /tesis/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /estudiante/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /profesor/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /encargado/i })).toBeInTheDocument();

        expect(screen.getByTestId('tesis-form')).toBeInTheDocument();
    });

    it('cambia de pestañas correctamente', async () => {
        render(<ManagementForm />);

        // Clic en pestaña Estudiante
        fireEvent.click(screen.getByRole('tab', { name: /estudiante/i }));
        await waitFor(() => {
            expect(screen.getByTestId('persona-form-estudiante')).toBeInTheDocument();
        });

        // Clic en pestaña Profesor
        fireEvent.click(screen.getByRole('tab', { name: /profesor/i }));
        await waitFor(() => {
            expect(screen.getByTestId('persona-form-profesor')).toBeInTheDocument();
        });

        // Clic en pestaña Encargado
        fireEvent.click(screen.getByRole('tab', { name: /encargado/i }));
        await waitFor(() => {
            expect(screen.getByTestId('persona-form-encargado')).toBeInTheDocument();
        });
    });

    it('obtiene opciones al montar', async () => {
        render(<ManagementForm />);

        await waitFor(() => {
            expect(userService.getProfesores).toHaveBeenCalled();
            expect(userService.getEncargados).toHaveBeenCalled();
            expect(userService.getSedes).toHaveBeenCalled();
            expect(userService.getEstudiantes).toHaveBeenCalled();
        });
    });
});
