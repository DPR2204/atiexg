import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
    const { signIn, signUp, user, loading } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');

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

        if (mode === 'login') {
            const result = await signIn(email, password);
            if (result.error) {
                setError(result.error);
            } else {
                navigate('/backoffice', { replace: true });
            }
        } else {
            if (!name.trim()) {
                setError('El nombre es obligatorio');
                setSubmitting(false);
                return;
            }
            const result = await signUp(email, password, name);
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess('Cuenta creada. Revisa tu correo para confirmar o inicia sesión.');
                setMode('login');
            }
        }

        setSubmitting(false);
    };

    return (
        <div className="bo-login-page">
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
                                : 'Crear Cuenta'
                        }
                    </button>
                </form>

                <div className="bo-login-footer">
                    {mode === 'login' ? (
                        <p>
                            ¿No tienes cuenta?{' '}
                            <button className="bo-link" onClick={() => { setMode('register'); setError(''); }}>
                                Crea una aquí
                            </button>
                        </p>
                    ) : (
                        <p>
                            ¿Ya tienes cuenta?{' '}
                            <button className="bo-link" onClick={() => { setMode('login'); setError(''); }}>
                                Inicia sesión
                            </button>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
