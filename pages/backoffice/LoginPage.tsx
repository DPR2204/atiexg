import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type ThemePreference = 'light' | 'dark' | 'system';

const INVITE_CODE = import.meta.env.VITE_INVITE_CODE || '';

export default function LoginPage() {
    const { signIn, signUp, user, loading } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [themePreference, setThemePreference] = useLocalStorage<ThemePreference>('atiexg-bo-theme', 'system');
    const [systemDark, setSystemDark] = useState(() =>
        typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);

    const resolvedTheme = themePreference === 'system' ? (systemDark ? 'dark' : 'light') : themePreference;

    function cycleTheme() {
        const cycle: ThemePreference[] = ['light', 'dark', 'system'];
        const idx = cycle.indexOf(themePreference);
        setThemePreference(cycle[(idx + 1) % cycle.length]);
    }

    const ThemeIcon = themePreference === 'light' ? Sun : themePreference === 'dark' ? Moon : Monitor;

    // If already logged in, redirect
    if (!loading && user) {
        navigate('/backoffice', { replace: true });
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            if (mode === 'login') {
                const result = await signIn(email, password);
                if (result.error) {
                    setError(result.error);
                } else {
                    navigate('/backoffice', { replace: true });
                }
            } else if (mode === 'register') {
                if (!name.trim()) {
                    setError('El nombre es obligatorio');
                    setSubmitting(false);
                    return;
                }
                if (INVITE_CODE && inviteCode.trim() !== INVITE_CODE) {
                    setError('Código de invitación inválido. Solicítalo a un administrador.');
                    setSubmitting(false);
                    return;
                }
                const result = await signUp(email, password, name);
                if (result.error) {
                    setError(typeof result.error === 'string' ? result.error : 'Error al crear cuenta. Intenta de nuevo.');
                } else {
                    setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.');
                    setMode('login');
                    setPassword('');
                }
            } else if (mode === 'forgot') {
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/backoffice/login`,
                });
                if (resetError) {
                    setError(resetError.message);
                } else {
                    setSuccess('Si el correo existe, recibirás un enlace para restablecer tu contraseña.');
                    setMode('login');
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error inesperado');
        }

        setSubmitting(false);
    };

    return (
        <div className="bo-login-page" data-theme={resolvedTheme} style={{ position: 'relative' }}>
            <button
                className="bo-login-theme-toggle"
                onClick={cycleTheme}
                title={themePreference === 'light' ? 'Modo claro' : themePreference === 'dark' ? 'Modo oscuro' : 'Automático'}
                type="button"
            >
                <ThemeIcon size={16} />
            </button>
            <div className="bo-login-card">
                <div className="bo-login-header">
                    <span className="bo-login-logo">⛵</span>
                    <h1 className="bo-login-title">Atitlán Experiences</h1>
                    <p className="bo-login-subtitle">Panel de Coordinación</p>
                </div>

                <form onSubmit={handleSubmit} className="bo-login-form">
                    {mode === 'register' && (
                        <div className="bo-form-group">
                            <label className="bo-label" htmlFor="bo-name">Nombre completo</label>
                            <input
                                id="bo-name"
                                className="bo-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre"
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="bo-form-group">
                        <label className="bo-label" htmlFor="bo-email">Correo electrónico</label>
                        <input
                            id="bo-email"
                            className="bo-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@ejemplo.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    {mode !== 'forgot' && (
                        <div className="bo-form-group">
                            <label className="bo-label" htmlFor="bo-password">Contraseña</label>
                            <input
                                id="bo-password"
                                className="bo-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                        </div>
                    )}

                    {mode === 'register' && INVITE_CODE && (
                        <div className="bo-form-group">
                            <label className="bo-label" htmlFor="bo-invite">Código de invitación</label>
                            <input
                                id="bo-invite"
                                className="bo-input"
                                type="text"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Ingresa el código proporcionado"
                                required
                                autoComplete="off"
                            />
                            <span style={{ fontSize: '0.75rem', color: 'var(--bo-text-muted)', marginTop: '0.25rem', display: 'block' }}>
                                Solicita este código a un administrador
                            </span>
                        </div>
                    )}

                    {error && <div className="bo-alert bo-alert--error">{error}</div>}
                    {success && <div className="bo-alert bo-alert--success">{success}</div>}

                    <button
                        type="submit"
                        className="bo-btn bo-btn--primary bo-btn--full"
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Procesando...'
                            : mode === 'login'
                                ? 'Iniciar Sesión'
                                : mode === 'register'
                                    ? 'Crear Cuenta'
                                    : 'Enviar Enlace'
                        }
                    </button>
                </form>

                <div className="bo-login-footer">
                    {mode === 'login' && (
                        <>
                            <p>
                                <button className="bo-link" onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}>
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </p>
                            <p>
                                ¿No tienes cuenta?{' '}
                                <button className="bo-link" onClick={() => { setMode('register'); setError(''); setSuccess(''); }}>
                                    Crea una aquí
                                </button>
                            </p>
                        </>
                    )}
                    {(mode === 'register' || mode === 'forgot') && (
                        <p>
                            <button className="bo-link" onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                                ← Volver a iniciar sesión
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
