import React, { useEffect, useMemo, useState } from 'react';

import { api } from '../api';
import Modal from '../ui/Modal';

const emptyForm = {
    name: '',
    location: '',
    type: '',
    criticality_level: 3,
    is_active: true,
};

export default function NodesPanel({ setError }) {
    const [nodes, setNodes] = useState([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [form, setForm] = useState({ ...emptyForm });

    const [editingNode, setEditingNode] = useState(null);
    const [editForm, setEditForm] = useState({ ...emptyForm });

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) {
            return nodes;
        }
        return nodes.filter((n) => `${n.name} ${n.location || ''} ${n.type || ''}`.toLowerCase().includes(q));
    }, [nodes, query]);

    const loadNodes = async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/nodes', { params: { per_page: 100 } });
            setNodes(res.data.data || []);
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to load nodes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNodes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreate = () => {
        setForm({ ...emptyForm });
        setIsCreateOpen(true);
    };

    const createNode = async (event) => {
        event.preventDefault();
        try {
            await api.post('/admin/nodes', form);
            setIsCreateOpen(false);
            await loadNodes();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to create node');
        }
    };

    const openEdit = (node) => {
        setEditingNode(node);
        setEditForm({
            name: node.name || '',
            location: node.location || '',
            type: node.type || '',
            criticality_level: node.criticality_level ?? 3,
            is_active: !!node.is_active,
        });
    };

    const updateNode = async (event) => {
        event.preventDefault();
        if (!editingNode) {
            return;
        }
        try {
            await api.patch(`/admin/nodes/${editingNode.id}`, editForm);
            setEditingNode(null);
            await loadNodes();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update node');
        }
    };

    const toggleActive = async (node) => {
        try {
            await api.patch(`/admin/nodes/${node.id}`, { is_active: !node.is_active });
            await loadNodes();
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update node');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Nodes</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Inventory node untuk mapping SLA prioritas dan monitoring.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <label className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 border border-transparent focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all dark:bg-slate-900 dark:text-slate-300 dark:focus-within:bg-slate-900 dark:focus-within:border-slate-700 dark:focus-within:ring-slate-800">
                        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                            <path d="M16.5 16.5 21 21" />
                        </svg>
                        <input
                            className="w-64 bg-transparent outline-none placeholder:text-slate-400"
                            placeholder="Search nodes"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>

                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                        type="button"
                        onClick={openCreate}
                    >
                        Add node
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Location</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Type</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Criticality</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filtered.map((node) => (
                                <tr key={node.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">{node.name}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{node.location || '-'}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{node.type || '-'}</td>
                                    <td className="px-6 py-3">
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                            L{node.criticality_level ?? 3}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {node.is_active ? (
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
                                            <button
                                                className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                                type="button"
                                                onClick={() => openEdit(node)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                                type="button"
                                                onClick={() => toggleActive(node)}
                                                disabled={isLoading}
                                            >
                                                {node.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        {isLoading ? 'Loading...' : 'No nodes found.'}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>

            <Modal
                title="Add node"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="submit" form="node-create-form">Create</button>
                    </>
                )}
            >
                <form id="node-create-form" className="grid gap-4 md:grid-cols-2" onSubmit={createNode}>
                    <Field label="Node name" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="Location">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                    </Field>
                    <Field label="Type">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
                    </Field>
                    <Field label="Criticality level (1-5)">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" type="number" min={1} max={5} value={form.criticality_level} onChange={(e) => setForm((p) => ({ ...p, criticality_level: Number(e.target.value) }))} />
                    </Field>
                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editingNode ? `Edit node: ${editingNode.name}` : 'Edit node'}
                isOpen={!!editingNode}
                onClose={() => setEditingNode(null)}
                footer={(
                    <>
                        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" type="button" onClick={() => setEditingNode(null)}>Cancel</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]" type="submit" form="node-edit-form">Save</button>
                    </>
                )}
            >
                <form id="node-edit-form" className="grid gap-4 md:grid-cols-2" onSubmit={updateNode}>
                    <Field label="Node name" required className="md:col-span-2">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    </Field>
                    <Field label="Location">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" value={editForm.location} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} />
                    </Field>
                    <Field label="Type">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))} />
                    </Field>
                    <Field label="Criticality level (1-5)">
                        <input className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all" type="number" min={1} max={5} value={editForm.criticality_level} onChange={(e) => setEditForm((p) => ({ ...p, criticality_level: Number(e.target.value) }))} />
                    </Field>
                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
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
