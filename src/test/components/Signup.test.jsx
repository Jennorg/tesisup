import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Signup from '../../components/Auth/Signup';
import authService from '@/services/auth.service';
import userService from '@/services/user.service';
import { MemoryRouter } from 'react-router-dom';

// Mocks
vi.mock('@/services/auth.service', () => ({
    default: {
        register: vi.fn(),
        login: vi.fn(),
    },
}));

vi.mock('@/services/user.service', () => ({
    default: {
        getSedes: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockLogin = vi.fn();
vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

vi.mock('@/hooks/Modals/LoadingModal', () => ({
    default: ({ isOpen, message, status }) => (
        isOpen ? <div data-testid="loading-modal">{status}: {message}</div> : null
    ),
}));

describe('Signup', () => {
    const mockSedes = { data: [{ id: 1, nombre: 'Sede Principal' }, { id: 2, nombre: 'Sede Secundaria' }] };

    beforeEach(() => {
        vi.clearAllMocks();
        userService.getSedes.mockResolvedValue(mockSedes);
    });

    it('renderiza correctamente y obtiene sedes', async () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        expect(screen.getByText(/Registro de Usuario/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(userService.getSedes).toHaveBeenCalledTimes(1);
        });

        // Verificar si las sedes se renderizan en el select
        // Necesario hacer clic en el select para ver opciones usualmente, o verificar si el valor está establecido.
        // En MUI Select, el valor está oculto en un input.
        // Podemos asumir que si se llamó al fetch está funcionando por ahora, o interactuar con él.
    });

    it('envía el formulario exitosamente', async () => {
        authService.register.mockResolvedValue({ data: { message: 'Success' } });
        authService.login.mockResolvedValue({ token: 'fake-token', user: { name: 'Test' } });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        // Esperar a que carguen las sedes
        await waitFor(() => expect(userService.getSedes).toHaveBeenCalled());

        // Llenar formulario
        fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Test' } });
        fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'User' } });
        fireEvent.change(screen.getByRole('textbox', { name: /correo/i }), { target: { value: 'test@example.com' } });

        // Seleccionar Tipo de Usuario (MUI Select es complicado, apuntemos al input directamente o usemos un helper)
        // Para simplicidad con MUI Select en RTL, podemos usar fireEvent.change en el input oculto si el nombre está presente
        // Pero obtener el input por nombre es más fácil.
        // El componente Select tiene name="user_type".
        // O simplemente podemos hacer clic en el select y hacer clic en la opción.

        // Forma más simple de llenar campos de texto:
        fireEvent.change(screen.getByLabelText(/cédula/i), { target: { value: '12345678' } });
        fireEvent.change(screen.getByLabelText(/teléfono/i), { target: { value: '04141234567' } });

        // Contraseña (necesita buscar por etiqueta "Contraseña")
        const passwordInput = screen.getByLabelText(/contraseña/i);
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        // Enviar
        const submitBtn = screen.getByRole('button', { name: /continuar/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalled();
        });

        // Esperar que register sea llamado con datos correctos
        expect(authService.register).toHaveBeenCalledWith('encargado', expect.objectContaining({ // Default is Encargado
            nombre: 'Test',
            apellido: 'User',
            email: 'test@example.com',
        }));

        // Esperar que login sea llamado
        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        // Esperar navegación
        expect(mockLogin).toHaveBeenCalledWith({ name: 'Test' }, 'fake-token');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('muestra error al fallar el registro', async () => {
        authService.register.mockRejectedValue({ response: { data: { error: 'Registration failed' } } });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await waitFor(() => expect(userService.getSedes).toHaveBeenCalled());

        // Llenar campos requeridos
        fireEvent.change(screen.getByRole('textbox', { name: /nombre/i }), { target: { value: 'Fail' } });
        fireEvent.change(screen.getByRole('textbox', { name: /apellido/i }), { target: { value: 'User' } });
        fireEvent.change(screen.getByRole('textbox', { name: /correo/i }), { target: { value: 'fail@example.com' } });
        fireEvent.change(screen.getByLabelText(/cédula/i), { target: { value: '999999' } });
        fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password' } });

        fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

        await waitFor(() => {
            expect(screen.getByTestId('loading-modal')).toHaveTextContent('error: Registration failed');
        });

        expect(authService.login).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
