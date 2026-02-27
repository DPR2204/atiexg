import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function PerfilPage() {
    const { agent, user, updateProfile, updatePassword } = useAuth();

    // Profile form
    const [name, setName] = useState(agent?.name || '');
    const [saving, setSaving] = useState(false);

    // Password form
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    async function handleSaveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('El nombre no puede estar vacío');
            return;
        }
        setSaving(true);
        const { error } = await updateProfile({ name: name.trim() });
        if (error) toast.error(error);
        else toast.success('Perfil actualizado');
        setSaving(false);
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Mínimo 6 caracteres');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        setChangingPassword(true);
        const { error } = await updatePassword(newPassword);
        if (error) toast.error(error);
        else {
            toast.success('Contraseña actualizada');
            setNewPassword('');
            setConfirmPassword('');
        }
        setChangingPassword(false);
    }

    return (
        <div className="bo-perfil-page">
            <div className="bo-page-header">
                <h1 className="bo-page-title">Mi Perfil</h1>
                <p className="bo-page-subtitle">Administra tu información personal</p>
            </div>

            <div className="bo-perfil-grid">
                {/* Profile Info */}
                <div className="bo-section-card">
                    <div className="bo-section-header">
                        <h3 className="bo-section-title">Información Personal</h3>
                    </div>
                    <div className="bo-section-body">
                        <form onSubmit={handleSaveProfile}>
                            <div className="bo-form-group">
                                <label className="bo-label" htmlFor="perfil-email">Correo electrónico</label>
                                <input
                                    id="perfil-email"
                                    className="bo-input"
                                    value={user?.email || ''}
                                    disabled
                                />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label" htmlFor="perfil-name">Nombre</label>
                                <input
                                    id="perfil-name"
                                    className="bo-input"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Tu nombre completo"
                                />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label" htmlFor="perfil-role">Rol</label>
                                <input
                                    id="perfil-role"
                                    className="bo-input"
                                    value={agent?.role === 'admin' ? 'Administrador' : 'Agente'}
                                    disabled
                                />
                            </div>
                            <div style={{ padding: 'var(--bo-space-3, 8px) var(--bo-space-4, 12px)' }}>
                                <button
                                    type="submit"
                                    className="bo-btn bo-btn--primary"
                                    disabled={saving || name === agent?.name}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Password */}
                <div className="bo-section-card">
                    <div className="bo-section-header">
                        <h3 className="bo-section-title">Cambiar Contraseña</h3>
                    </div>
                    <div className="bo-section-body">
                        <form onSubmit={handleChangePassword}>
                            <div className="bo-form-group">
                                <label className="bo-label" htmlFor="perfil-pw">Nueva contraseña</label>
                                <input
                                    id="perfil-pw"
                                    className="bo-input"
                                    type="password"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label" htmlFor="perfil-pw-confirm">Confirmar contraseña</label>
                                <input
                                    id="perfil-pw-confirm"
                                    className="bo-input"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Repite la contraseña"
                                    autoComplete="new-password"
                                />
                            </div>
                            <div style={{ padding: 'var(--bo-space-3, 8px) var(--bo-space-4, 12px)' }}>
                                <button
                                    type="submit"
                                    className="bo-btn bo-btn--primary"
                                    disabled={changingPassword || !newPassword}
                                >
                                    {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
