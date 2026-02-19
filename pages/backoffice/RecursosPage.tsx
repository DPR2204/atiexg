import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Boat, Staff } from '../../types/backoffice';

export default function RecursosPage() {
    const { isAdmin } = useAuth();
    const [boats, setBoats] = useState<Boat[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBoatForm, setShowBoatForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [editingBoat, setEditingBoat] = useState<Boat | null>(null);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    const [boatForm, setBoatForm] = useState({ name: '', capacity: 10, status: 'active' as Boat['status'], notes: '' });
    const [staffForm, setStaffForm] = useState({ name: '', role: 'lanchero' as Staff['role'], phone: '', notes: '' });

    useEffect(() => { fetchAll(); }, []);

    async function fetchAll() {
        const [{ data: boatData }, { data: staffData }] = await Promise.all([
            supabase.from('boats').select('*').order('id'),
            supabase.from('staff').select('*').order('name'),
        ]);
        setBoats((boatData as Boat[]) || []);
        setStaffList((staffData as Staff[]) || []);
        setLoading(false);
    }

    // Boat CRUD
    async function saveBoat(e: React.FormEvent) {
        e.preventDefault();
        if (editingBoat) {
            await supabase.from('boats').update(boatForm).eq('id', editingBoat.id);
        } else {
            await supabase.from('boats').insert([boatForm]);
        }
        setShowBoatForm(false);
        setEditingBoat(null);
        setBoatForm({ name: '', capacity: 10, status: 'active', notes: '' });
        fetchAll();
    }

    function startEditBoat(boat: Boat) {
        setBoatForm({ name: boat.name, capacity: boat.capacity, status: boat.status, notes: boat.notes || '' });
        setEditingBoat(boat);
        setShowBoatForm(true);
    }

    // Staff CRUD
    async function saveStaff(e: React.FormEvent) {
        e.preventDefault();
        if (editingStaff) {
            await supabase.from('staff').update(staffForm).eq('id', editingStaff.id);
        } else {
            await supabase.from('staff').insert([staffForm]);
        }
        setShowStaffForm(false);
        setEditingStaff(null);
        setStaffForm({ name: '', role: 'lanchero', phone: '', notes: '' });
        fetchAll();
    }

    function startEditStaff(member: Staff) {
        setStaffForm({ name: member.name, role: member.role, phone: member.phone || '', notes: member.notes || '' });
        setEditingStaff(member);
        setShowStaffForm(true);
    }

    async function toggleStaffActive(member: Staff) {
        await supabase.from('staff').update({ active: !member.active }).eq('id', member.id);
        fetchAll();
    }

    if (loading) return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;

    const lancheros = staffList.filter(s => s.role === 'lanchero');
    const guias = staffList.filter(s => s.role === 'guia');

    return (
        <div className="bo-recursos">
            <header className="bo-header">
                <h2 className="bo-title">Recursos Operativos</h2>
                <p className="bo-subtitle">Gestión de flota y personal autorizado</p>
            </header>

            {/* Boats */}
            <div className="bo-section-card">
                <div className="bo-section-header">
                    <h3 className="bo-section-title">🚤 Flota de Lanchas <span className="bo-count">{boats.length}</span></h3>
                    {isAdmin && (
                        <button className="bo-btn bo-btn--primary" onClick={() => { setBoatForm({ name: '', capacity: 10, status: 'active', notes: '' }); setEditingBoat(null); setShowBoatForm(true); }}>
                            + Nueva Lancha
                        </button>
                    )}
                </div>

                {boats.length === 0 ? (
                    <div className="bo-empty-state">
                        <span className="bo-empty-state-icon">🚤</span>
                        <p>No hay lanchas registradas</p>
                    </div>
                ) : (
                    <div className="bo-table-container">
                        <table className="bo-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Capacidad</th>
                                    <th>Estado</th>
                                    <th className="bo-text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {boats.map(boat => (
                                    <tr key={boat.id}>
                                        <td className="bo-cell-bold">{boat.name}</td>
                                        <td>{boat.capacity} pax</td>
                                        <td>
                                            <span className="bo-status-badge" style={{
                                                backgroundColor: boat.status === 'active' ? 'var(--bo-success-bg)' : boat.status === 'maintenance' ? 'var(--bo-warning-bg)' : 'var(--bo-danger-bg)',
                                                color: boat.status === 'active' ? 'var(--bo-success)' : boat.status === 'maintenance' ? 'var(--bo-warning)' : 'var(--bo-danger)'
                                            }}>
                                                {boat.status === 'active' ? 'Activa' : boat.status === 'maintenance' ? 'Mantenimiento' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="bo-text-right">
                                            {isAdmin && (
                                                <button className="bo-btn bo-btn--ghost bo-btn--sm" onClick={() => startEditBoat(boat)}>Editar</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Staff */}
            <div className="bo-grid bo-grid--2">
                {/* Lancheros */}
                <div className="bo-section-card">
                    <div className="bo-section-header">
                        <h3 className="bo-section-title">⚓ Lancheros <span className="bo-count">{lancheros.length}</span></h3>
                        {isAdmin && (
                            <button className="bo-btn bo-btn--secondary bo-btn--sm" onClick={() => { setStaffForm({ name: '', role: 'lanchero', phone: '', notes: '' }); setEditingStaff(null); setShowStaffForm(true); }}>
                                + Agregar
                            </button>
                        )}
                    </div>

                    {lancheros.length === 0 ? (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon">⚓</span>
                            <p>No hay lancheros registrados</p>
                        </div>
                    ) : (
                        <div className="bo-table-container">
                            <table className="bo-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Estado</th>
                                        <th className="bo-text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lancheros.map(member => (
                                        <tr key={member.id}>
                                            <td className="bo-cell-bold">{member.name}</td>
                                            <td>
                                                <span className="bo-status-badge" style={{
                                                    backgroundColor: member.active ? 'var(--bo-success-bg)' : 'var(--bo-danger-bg)',
                                                    color: member.active ? 'var(--bo-success)' : 'var(--bo-danger)'
                                                }}>
                                                    {member.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="bo-text-right">
                                                {isAdmin && (
                                                    <div className="bo-flex bo-gap-1 bo-justify-end">
                                                        <button className="bo-btn bo-btn--ghost bo-btn--sm" onClick={() => startEditStaff(member)}>Editar</button>
                                                        <button className={`bo-btn bo-btn--sm ${member.active ? 'bo-btn--danger' : 'bo-btn--primary'}`} onClick={() => toggleStaffActive(member)}>
                                                            {member.active ? 'Baja' : 'Alta'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Guides */}
                <div className="bo-section-card">
                    <div className="bo-section-header">
                        <h3 className="bo-section-title">🧭 Guías <span className="bo-count">{guias.length}</span></h3>
                        {isAdmin && (
                            <button className="bo-btn bo-btn--secondary bo-btn--sm" onClick={() => { setStaffForm({ name: '', role: 'guia', phone: '', notes: '' }); setEditingStaff(null); setShowStaffForm(true); }}>
                                + Agregar
                            </button>
                        )}
                    </div>

                    {guias.length === 0 ? (
                        <div className="bo-empty-state">
                            <span className="bo-empty-state-icon">🧭</span>
                            <p>No hay guías registrados</p>
                        </div>
                    ) : (
                        <div className="bo-table-container">
                            <table className="bo-table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Estado</th>
                                        <th className="bo-text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guias.map(member => (
                                        <tr key={member.id}>
                                            <td className="bo-cell-bold">{member.name}</td>
                                            <td>
                                                <span className="bo-status-badge" style={{
                                                    backgroundColor: member.active ? 'var(--bo-success-bg)' : 'var(--bo-danger-bg)',
                                                    color: member.active ? 'var(--bo-success)' : 'var(--bo-danger)'
                                                }}>
                                                    {member.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="bo-text-right">
                                                {isAdmin && (
                                                    <div className="bo-flex bo-gap-1 bo-justify-end">
                                                        <button className="bo-btn bo-btn--ghost bo-btn--sm" onClick={() => startEditStaff(member)}>Editar</button>
                                                        <button className={`bo-btn bo-btn--sm ${member.active ? 'bo-btn--danger' : 'bo-btn--primary'}`} onClick={() => toggleStaffActive(member)}>
                                                            {member.active ? 'Baja' : 'Alta'}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Boat Form Modal */}
            {showBoatForm && (
                <div className="bo-modal-overlay" onClick={() => setShowBoatForm(false)}>
                    <div className="bo-modal bo-modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="bo-modal-header">
                            <h3>{editingBoat ? 'Editar Lancha' : 'Nueva Lancha'}</h3>
                            <button className="bo-modal-close" onClick={() => setShowBoatForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveBoat} className="bo-modal-body">
                            <div className="bo-form-group">
                                <label className="bo-label">Nombre</label>
                                <input className="bo-input" value={boatForm.name} onChange={(e) => setBoatForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Capacidad</label>
                                <input className="bo-input" type="number" value={boatForm.capacity} onChange={(e) => setBoatForm(p => ({ ...p, capacity: Number(e.target.value) }))} />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Estado</label>
                                <select className="bo-input" value={boatForm.status} onChange={(e) => setBoatForm(p => ({ ...p, status: e.target.value as Boat['status'] }))}>
                                    <option value="active">Activa</option>
                                    <option value="maintenance">Mantenimiento</option>
                                    <option value="inactive">Inactiva</option>
                                </select>
                            </div>
                            <div className="bo-modal-actions">
                                <button type="button" className="bo-btn bo-btn--ghost" onClick={() => setShowBoatForm(false)}>Cancelar</button>
                                <button type="submit" className="bo-btn bo-btn--primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Staff Form Modal */}
            {showStaffForm && (
                <div className="bo-modal-overlay" onClick={() => setShowStaffForm(false)}>
                    <div className="bo-modal bo-modal--sm" onClick={(e) => e.stopPropagation()}>
                        <div className="bo-modal-header">
                            <h3>{editingStaff ? 'Editar Personal' : 'Nuevo Personal'}</h3>
                            <button className="bo-modal-close" onClick={() => setShowStaffForm(false)}>✕</button>
                        </div>
                        <form onSubmit={saveStaff} className="bo-modal-body">
                            <div className="bo-form-group">
                                <label className="bo-label">Nombre</label>
                                <input className="bo-input" value={staffForm.name} onChange={(e) => setStaffForm(p => ({ ...p, name: e.target.value }))} required />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Rol</label>
                                <select className="bo-input" value={staffForm.role} onChange={(e) => setStaffForm(p => ({ ...p, role: e.target.value as Staff['role'] }))}>
                                    <option value="lanchero">Lanchero</option>
                                    <option value="guia">Guía</option>
                                </select>
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Teléfono</label>
                                <input className="bo-input" value={staffForm.phone} onChange={(e) => setStaffForm(p => ({ ...p, phone: e.target.value }))} placeholder="+502..." />
                            </div>
                            <div className="bo-modal-actions">
                                <button type="button" className="bo-btn bo-btn--ghost" onClick={() => setShowStaffForm(false)}>Cancelar</button>
                                <button type="submit" className="bo-btn bo-btn--primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
