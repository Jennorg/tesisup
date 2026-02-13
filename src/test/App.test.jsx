import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { describe, it, expect, vi } from 'vitest';

// Mockear componentes hijos para evitar renderizado profundo y problemas de contexto
vi.mock('@/components/Auth/Login', () => ({ default: () => <div>Login Component</div> }));
vi.mock('@/components/Auth/Signup', () => ({ default: () => <div>Signup Component</div> }));
vi.mock('@/components/main/MainPage', () => ({ default: () => <div>MainPage Component</div> }));
vi.mock('@/components/main/Profile/Profile', () => ({ default: () => <div>Profile Component</div> }));
vi.mock('@/utils/Auth', () => ({ default: () => <div>Auth Wrapper</div> }));

describe('App', () => {
    it('renderiza la ruta de Login', () => {
        render(
            <MemoryRouter initialEntries={['/login']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Login Component')).toBeInTheDocument();
    });

    it('renderiza la ruta de Signup', () => {
        render(
            <MemoryRouter initialEntries={['/signUp']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Signup Component')).toBeInTheDocument();
    });

    it('renderiza 404 para una ruta desconocida', () => {
        render(
            <MemoryRouter initialEntries={['/unknown']}>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('404 Not Found')).toBeInTheDocument();
    });
});
