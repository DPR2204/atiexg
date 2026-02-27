import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Supplier, SupplierCategory, SUPPLIER_CATEGORY_LABELS } from '../../types/backoffice';
import { toast } from 'sonner';
import { Search, Phone, Globe, Instagram, Mail, X } from 'lucide-react';

const CATEGORIES: SupplierCategory[] = ['transporte', 'masajes', 'restaurantes', 'hospedaje', 'actividades', 'otro'];

const CATEGORY_COLORS: Record<SupplierCategory, { bg: string; color: string }> = {
    transporte: { bg: 'var(--bo-info-bg)', color: 'var(--bo-info)' },
    masajes: { bg: '#F3EAFD', color: '#8427E0' },
    restaurantes: { bg: 'var(--bo-warning-bg)', color: 'var(--bo-warning)' },
    hospedaje: { bg: 'var(--bo-success-bg)', color: 'var(--bo-success)' },
    actividades: { bg: '#E0F7FA', color: '#00838F' },
    otro: { bg: 'var(--bo-hover)', color: 'var(--bo-text-secondary)' },
};

const EMPTY_FORM = { name: '', category: 'otro' as SupplierCategory, phone: '', email: '', website: '', instagram: '', notes: '' };

export default function ProveedoresPage() {
    const { isAdmin } = useAuth();
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => { fetchSuppliers(); }, []);

    async function fetchSuppliers() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('suppliers')
                .select('*')
                .eq('active', true)
                .order('name');
            if (error) throw error;
            setSuppliers((data || []) as Supplier[]);
        } catch (err) {
            console.error('Error fetching suppliers:', err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        let list = suppliers;
        if (filterCategory !== 'all') list = list.filter(s => s.category === filterCategory);
        const q = searchQuery.toLowerCase().trim();
        if (q) list = list.filter(s => s.name.toLowerCase().includes(q) || s.notes?.toLowerCase().includes(q));
        return list;
    }, [suppliers, filterCategory, searchQuery]);

    function openForm(supplier?: Supplier) {
        if (supplier) {
            setEditingId(supplier.id);
            setForm({
                name: supplier.name,
                category: supplier.category,
                phone: supplier.phone || '',
                email: supplier.email || '',
                website: supplier.website || '',
                instagram: supplier.instagram || '',
                notes: supplier.notes || '',
            });
        } else {
            setEditingId(null);
            setForm(EMPTY_FORM);
        }
        setShowForm(true);
    }

    async function handleSave() {
        if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }

        const payload = {
            name: form.name.trim(),
            category: form.category,
            phone: form.phone.trim() || null,
            email: form.email.trim() || null,
            website: form.website.trim() || null,
            instagram: form.instagram.trim() || null,
            notes: form.notes.trim() || null,
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('suppliers').update(payload).eq('id', editingId);
                if (error) throw error;
                toast.success('Proveedor actualizado');
            } else {
                const { error } = await supabase.from('suppliers').insert([payload]);
                if (error) throw error;
                toast.success('Proveedor agregado');
            }
            setShowForm(false);
            fetchSuppliers();
        } catch (err: any) {
            toast.error(err?.message || 'Error al guardar');
        }
    }

    async function handleDelete(id: number, name: string) {
        if (!confirm(`¿Eliminar "${name}"?`)) return;
        try {
            const { error } = await supabase.from('suppliers').update({ active: false }).eq('id', id);
            if (error) throw error;
            toast.success('Proveedor eliminado');
            fetchSuppliers();
        } catch (err: any) {
            toast.error(err?.message || 'Error al eliminar');
        }
    }

    if (loading) return <div className="bo-loading"><div className="bo-loading-spinner" /></div>;

    return (
        <div>
            {/* Header */}
            <header className="bo-header bo-flex bo-justify-between bo-align-center">
                <div>
                    <h2 className="bo-title">Proveedores y Contactos</h2>
                    <p className="bo-subtitle">{suppliers.length} proveedores registrados</p>
                </div>
                {isAdmin && (
                    <button className="bo-btn bo-btn--primary" onClick={() => openForm()}>
                        + Nuevo Proveedor
                    </button>
                )}
            </header>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 250px', maxWidth: '400px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--bo-text-muted)' }} />
                    <input
                        className="bo-input"
                        placeholder="Buscar proveedor..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '32px', width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <button className={`bo-filter-tab ${filterCategory === 'all' ? 'bo-filter-tab--active' : ''}`} onClick={() => setFilterCategory('all')}>Todas</button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`bo-filter-tab ${filterCategory === cat ? 'bo-filter-tab--active' : ''}`}
                            style={filterCategory === cat ? { backgroundColor: CATEGORY_COLORS[cat].bg, color: CATEGORY_COLORS[cat].color } : {}}
                            onClick={() => setFilterCategory(cat)}
                        >
                            {SUPPLIER_CATEGORY_LABELS[cat]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Supplier Grid */}
            {filtered.length === 0 ? (
                <div className="bo-empty-state">
                    <p>No se encontraron proveedores</p>
                </div>
            ) : (
                <div className="bo-supplier-grid">
                    {filtered.map(s => {
                        const catColor = CATEGORY_COLORS[s.category];
                        return (
                            <div key={s.id} className="bo-supplier-card">
                                <div className="bo-supplier-card-header">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h4 className="bo-supplier-card-name">{s.name}</h4>
                                        <span className="bo-supplier-category" style={{ backgroundColor: catColor.bg, color: catColor.color }}>
                                            {SUPPLIER_CATEGORY_LABELS[s.category]}
                                        </span>
                                    </div>
                                    {isAdmin && (
                                        <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                                            <button className="bo-btn bo-btn--ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => openForm(s)}>Editar</button>
                                            <button className="bo-btn bo-btn--ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--bo-danger)' }} onClick={() => handleDelete(s.id, s.name)}>Eliminar</button>
                                        </div>
                                    )}
                                </div>
                                <div className="bo-supplier-card-body">
                                    {s.phone && (
                                        <a href={`tel:${s.phone}`} className="bo-supplier-link">
                                            <Phone size={14} /> {s.phone}
                                        </a>
                                    )}
                                    {s.email && (
                                        <a href={`mailto:${s.email}`} className="bo-supplier-link">
                                            <Mail size={14} /> {s.email}
                                        </a>
                                    )}
                                    {s.instagram && (
                                        <a href={s.instagram.startsWith('http') ? s.instagram : `https://instagram.com/${s.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="bo-supplier-link">
                                            <Instagram size={14} /> {s.instagram.startsWith('http') ? s.instagram.split('/').pop() : s.instagram}
                                        </a>
                                    )}
                                    {s.website && (
                                        <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noopener noreferrer" className="bo-supplier-link">
                                            <Globe size={14} /> {s.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                        </a>
                                    )}
                                    {s.notes && (
                                        <p className="bo-supplier-notes">{s.notes}</p>
                                    )}
                                    {!s.phone && !s.email && !s.instagram && !s.website && !s.notes && (
                                        <p style={{ color: 'var(--bo-text-muted)', fontSize: '0.8125rem', fontStyle: 'italic' }}>Sin información de contacto</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="bo-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="bo-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="bo-modal-header">
                            <h3>{editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
                            <button className="bo-btn bo-btn--ghost" onClick={() => setShowForm(false)} style={{ padding: '0.25rem' }}><X size={18} /></button>
                        </div>
                        <div className="bo-modal-body">
                            <div className="bo-form-group">
                                <label className="bo-label">Nombre *</label>
                                <input className="bo-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nombre del proveedor" />
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Categoría</label>
                                <select className="bo-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as SupplierCategory })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{SUPPLIER_CATEGORY_LABELS[c]}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="bo-form-group">
                                    <label className="bo-label">Teléfono</label>
                                    <input className="bo-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+502 1234 5678" />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Email</label>
                                    <input className="bo-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div className="bo-form-group">
                                    <label className="bo-label">Instagram</label>
                                    <input className="bo-input" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@usuario o URL" />
                                </div>
                                <div className="bo-form-group">
                                    <label className="bo-label">Sitio Web</label>
                                    <input className="bo-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="www.ejemplo.com" />
                                </div>
                            </div>
                            <div className="bo-form-group">
                                <label className="bo-label">Notas</label>
                                <textarea className="bo-input" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Información adicional..." />
                            </div>
                        </div>
                        <div className="bo-modal-footer">
                            <button className="bo-btn bo-btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                            <button className="bo-btn bo-btn--primary" onClick={handleSave}>{editingId ? 'Guardar Cambios' : 'Agregar Proveedor'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
