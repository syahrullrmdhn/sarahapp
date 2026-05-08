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

    const webhookList = integrations?.webhook_sources || [];
    const telegram = integrations?.telegram || null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Integrations</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Webhook receiver secured with HMAC signature verification.</p>
            </div>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">Webhook ingest</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Sources send events into SARAH using an endpoint scoped by slug.
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Endpoint</div>
                        <div className="mt-2 font-mono break-all">POST /api/webhooks/{'{sourceSlug}'}</div>
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Signed using shared secret (server verifies signature).
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Configured sources</div>
                        <div className="mt-2 space-y-2">
                            {webhookList.map((src) => (
                                <div key={src.slug} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                                    <div className="min-w-0">
                                        <div className="text-slate-900 dark:text-slate-100 truncate">{src.name}</div>
                                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{src.slug}</div>
                                    </div>
                                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                        {src.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))}
                            {webhookList.length === 0 ? (
                                <div className="text-sm text-slate-500 dark:text-slate-400">No public sources found.</div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-base font-medium text-slate-900 dark:text-slate-100">Telegram bot webhook</div>
                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Endpoint is ready. You can configure Telegram later.
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Endpoint</div>
                        <div className="mt-2 font-mono break-all">POST /api/integrations/telegram/webhook</div>
                        <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                            Protected by secret header: <span className="font-mono">X-Telegram-Bot-Api-Secret-Token</span>.
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Status</div>
                        <div className="mt-2 text-slate-700 dark:text-slate-200">
                            {telegram ? 'Configured' : 'Not configured'}
                        </div>
                    </div>
                </div>
            </section>

            {canManageIntegrations ? (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <div>
                            <div className="text-base font-medium text-slate-900 dark:text-slate-100">Manage webhook sources</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, disable, and rotate shared secrets.</div>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 border border-transparent focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all dark:bg-slate-900 dark:text-slate-300 dark:focus-within:bg-slate-900 dark:focus-within:border-slate-700 dark:focus-within:ring-slate-800">
                                <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                                    <path d="M16.5 16.5 21 21" />
                                </svg>
                                <input className="w-56 bg-transparent outline-none placeholder:text-slate-400" placeholder="Search sources" value={q} onChange={(e) => setQ(e.target.value)} />
                            </label>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="button" onClick={openCreate}>
                                Add source
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Name</th>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Slug</th>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                                    <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredAdmin.map((source) => (
                                    <tr key={source.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                        <td className="px-6 py-3 text-slate-900 dark:text-slate-100">{source.name}</td>
                                        <td className="px-6 py-3 text-slate-500 dark:text-slate-400 font-mono">{source.slug}</td>
                                        <td className="px-6 py-3">
                                            {source.is_active ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/40 px-2.5 py-1 text-xs font-medium">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-900/40 px-2.5 py-1 text-xs font-medium">
                                                    Disabled
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => openEdit(source)}>
                                                    Edit
                                                </button>
                                                <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => toggleActive(source)} disabled={isLoading}>
                                                    {source.is_active ? 'Disable' : 'Enable'}
                                                </button>
                                                <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => rotateSecret(source)}>
                                                    Rotate secret
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredAdmin.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
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
                title="Add webhook source"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="submit" form="webhook-source-create">Create</button>
                    </>
                )}
            >
                <form id="webhook-source-create" className="grid gap-4 md:grid-cols-2" onSubmit={createSource}>
                    <Field label="Name" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="Slug (e.g. zabbix-prod)" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={createForm.slug} onChange={(e) => setCreateForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} />
                    </Field>
                    <Field label="Shared secret (optional, auto-generate if empty)" className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" value={createForm.shared_secret} onChange={(e) => setCreateForm((p) => ({ ...p, shared_secret: e.target.value }))} />
                    </Field>
                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editing ? `Edit source: ${editing.slug}` : 'Edit source'}
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                footer={(
                    <>
                        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => setEditing(null)}>Cancel</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="submit" form="webhook-source-edit">Save</button>
                    </>
                )}
            >
                <form id="webhook-source-edit" className="grid gap-4 md:grid-cols-2" onSubmit={updateSource}>
                    <Field label="Name" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="Slug" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={editForm.slug} onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value.toLowerCase() }))} />
                    </Field>
                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="button" onClick={() => setSecretReveal(null)}>
                        Done
                    </button>
                )}
            >
                <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Copy this secret now. It will not be shown again.</p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Source</div>
                        <div className="mt-2 font-mono break-all text-sm text-slate-900 dark:text-slate-100">{secretReveal?.slug || '-'}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Shared secret</div>
                        <div className="mt-2 font-mono break-all text-sm text-slate-900 dark:text-slate-100">{secretReveal?.secret || '-'}</div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

function Field({ label, required, className, children }) {
    return (
        <label className={className}>
            <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                {label}{required ? ' *' : ''}
            </div>
            {children}
        </label>
    );
}

