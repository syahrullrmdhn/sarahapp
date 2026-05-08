import React, { useEffect, useMemo, useState } from 'react';

import { api } from '../api';
import Modal from '../ui/Modal';

const emptyForm = {
    name: '',
    slug: '',
    is_active: true,
    shared_secret: '',
};

export default function IntegrationPanel({ integrations, canManageIntegrations, setError, onRefresh }) {
    const [adminSources, setAdminSources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [q, setQ] = useState('');

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ ...emptyForm });

    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({ ...emptyForm });

    const [secretReveal, setSecretReveal] = useState(null);

    const filteredAdmin = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) {
            return adminSources;
        }
        return adminSources.filter((s) => `${s.name} ${s.slug}`.toLowerCase().includes(query));
    }, [adminSources, q]);

    const loadAdminSources = async () => {
        if (!canManageIntegrations) {
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.get('/admin/webhook-sources', { params: { per_page: 100 } });
            setAdminSources(res.data.data || []);
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to load webhook sources');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAdminSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canManageIntegrations]);

    const openCreate = () => {
        setCreateForm({ ...emptyForm });
        setIsCreateOpen(true);
    };

    const createSource = async (event) => {
        event.preventDefault();
        try {
            const payload = {
                name: createForm.name,
                slug: createForm.slug,
                is_active: !!createForm.is_active,
            };
            if ((createForm.shared_secret || '').trim() !== '') {
                payload.shared_secret = createForm.shared_secret.trim();
            }
            const res = await api.post('/admin/webhook-sources', payload);
            setIsCreateOpen(false);
            setSecretReveal({ title: 'Webhook secret created', secret: res.data.shared_secret, slug: res.data.source?.slug });
            await loadAdminSources();
            await onRefresh?.();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to create webhook source');
        }
    };

    const openEdit = (source) => {
        setEditing(source);
        setEditForm({
            name: source.name || '',
            slug: source.slug || '',
            is_active: !!source.is_active,
            shared_secret: '',
        });
    };

    const updateSource = async (event) => {
        event.preventDefault();
        if (!editing) {
            return;
        }
        try {
            await api.patch(`/admin/webhook-sources/${editing.id}`, {
                name: editForm.name,
                slug: editForm.slug,
                is_active: !!editForm.is_active,
            });
            setEditing(null);
            await loadAdminSources();
            await onRefresh?.();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update webhook source');
        }
    };

    const toggleActive = async (source) => {
        try {
            await api.patch(`/admin/webhook-sources/${source.id}`, { is_active: !source.is_active });
            await loadAdminSources();
            await onRefresh?.();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update webhook source');
        }
    };

    const rotateSecret = async (source) => {
        try {
            const res = await api.post(`/admin/webhook-sources/${source.id}/rotate-secret`);
            setSecretReveal({ title: 'Webhook secret rotated', secret: res.data.shared_secret, slug: res.data.source?.slug });
            await loadAdminSources();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to rotate secret');
        }
    };

    return (
        <div className="grid gap-4">
            <section className="cartel-card">
                <div className="cartel-card-head">
                    <div>
                        <div className="cartel-card-title">Integrations</div>
                        <div className="cartel-card-sub">Webhook receiver secured with HMAC signature verification.</div>
                    </div>
                </div>

                <div className="cartel-table-wrap">
                    <table className="cartel-table">
                        <thead>
                            <tr>
                                <th>Source</th>
                                <th>Slug</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(integrations.webhook_sources || []).map((source) => (
                                <tr key={source.slug}>
                                    <td className="cartel-table-strong">{source.name}</td>
                                    <td className="mono">{source.slug}</td>
                                    <td>{source.is_active ? <span className="cartel-badge">Active</span> : <span className="cartel-badge badge-p1">Inactive</span>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="cartel-mini-card" style={{ marginTop: 14 }}>
                    <div className="cartel-mini-kicker">Telegram Webhook Endpoint</div>
                    <div className="mono" style={{ marginTop: 8 }}>{integrations.telegram?.webhook_url || '-'}</div>
                    <div className="cartel-mini-sub" style={{ marginTop: 10 }}>
                        Secret header: <span className="mono">{integrations.telegram?.secret_header || '-'}</span>
                    </div>
                </div>
            </section>

            {canManageIntegrations ? (
                <section className="cartel-card">
                    <div className="cartel-card-head">
                        <div>
                            <div className="cartel-card-title">Manage Webhook Sources</div>
                            <div className="cartel-card-sub">Create, enable/disable, and rotate secrets.</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="cartel-search" style={{ width: 260 }}>
                                <input className="cartel-search-input" placeholder="Search sources" value={q} onChange={(e) => setQ(e.target.value)} />
                            </label>
                            <button className="cartel-btn cartel-btn-strong" type="button" onClick={openCreate}>
                                Add Source
                            </button>
                        </div>
                    </div>

                    <div className="cartel-table-wrap">
                        <table className="cartel-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Slug</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAdmin.map((source) => (
                                    <tr key={source.id}>
                                        <td className="cartel-table-strong">{source.name}</td>
                                        <td className="mono">{source.slug}</td>
                                        <td>{source.is_active ? <span className="cartel-badge">Active</span> : <span className="cartel-badge badge-p1">Disabled</span>}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <button className="cartel-btn" type="button" onClick={() => openEdit(source)}>
                                                    Edit
                                                </button>
                                                <button className="cartel-btn" type="button" onClick={() => toggleActive(source)} disabled={isLoading}>
                                                    {source.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                                <button className="cartel-btn" type="button" onClick={() => rotateSecret(source)}>
                                                    Rotate secret
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAdmin.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="cartel-empty">
                                            {isLoading ? 'Loading...' : 'No webhook sources found.'}
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            <Modal
                title="Add Webhook Source"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="webhook-source-create">Create</button>
                    </>
                )}
            >
                <form id="webhook-source-create" className="grid gap-3 md:grid-cols-2" onSubmit={createSource}>
                    <input className="input md:col-span-2" placeholder="Name" required value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Slug (e.g. zabbix-prod)" required value={createForm.slug} onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} />
                    <input className="input md:col-span-2" placeholder="Shared secret (optional, auto-generate if empty)" value={createForm.shared_secret} onChange={(e) => setCreateForm((p) => ({ ...p, shared_secret: e.target.value }))} />
                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editing ? `Edit Source: ${editing.slug}` : 'Edit Source'}
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setEditing(null)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="webhook-source-edit">Save</button>
                    </>
                )}
            >
                <form id="webhook-source-edit" className="grid gap-3 md:grid-cols-2" onSubmit={updateSource}>
                    <input className="input md:col-span-2" placeholder="Name" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Slug" required value={editForm.slug} onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} />
                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={secretReveal?.title || 'Secret'}
                isOpen={!!secretReveal}
                onClose={() => setSecretReveal(null)}
                footer={(
                    <>
                        <button className="cartel-btn cartel-btn-strong" type="button" onClick={() => setSecretReveal(null)}>Done</button>
                    </>
                )}
            >
                <div className="grid gap-2">
                    <div className="cartel-card-sub">Copy this secret now. It will not be shown again.</div>
                    <div className="cartel-mini-card">
                        <div className="cartel-mini-kicker">Source</div>
                        <div className="mono" style={{ marginTop: 8 }}>{secretReveal?.slug || '-'}</div>
                    </div>
                    <div className="cartel-mini-card">
                        <div className="cartel-mini-kicker">Shared Secret</div>
                        <div className="mono" style={{ marginTop: 8, whiteSpace: 'normal', wordBreak: 'break-word' }}>{secretReveal?.secret || '-'}</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
