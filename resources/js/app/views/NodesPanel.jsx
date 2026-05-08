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
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">Nodes</div>
                    <div className="cartel-card-sub">Inventory node untuk mapping SLA prioritas dan monitoring.</div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="cartel-search" style={{ width: 280 }}>
                        <input
                            className="cartel-search-input"
                            placeholder="Search nodes"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </label>
                    <button className="cartel-btn cartel-btn-strong" type="button" onClick={openCreate}>
                        Add Node
                    </button>
                </div>
            </div>

            <div className="cartel-table-wrap">
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Criticality</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((node) => (
                            <tr key={node.id}>
                                <td className="cartel-table-strong">{node.name}</td>
                                <td>{node.location || '-'}</td>
                                <td>{node.type || '-'}</td>
                                <td><span className="cartel-badge">L{node.criticality_level ?? 3}</span></td>
                                <td>{node.is_active ? <span className="cartel-badge">Active</span> : <span className="cartel-badge badge-p1">Disabled</span>}</td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <button className="cartel-btn" type="button" onClick={() => openEdit(node)}>
                                            Edit
                                        </button>
                                        <button className="cartel-btn" type="button" onClick={() => toggleActive(node)} disabled={isLoading}>
                                            {node.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="cartel-empty">
                                    {isLoading ? 'Loading...' : 'No nodes found.'}
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            <Modal
                title="Add Node"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="node-create-form">Create</button>
                    </>
                )}
            >
                <form id="node-create-form" className="grid gap-3 md:grid-cols-2" onSubmit={createNode}>
                    <input className="input md:col-span-2" placeholder="Node name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input" placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                    <input className="input" placeholder="Type (core/cloud/access)" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} />
                    <input className="input" type="number" min={1} max={5} placeholder="Criticality 1-5" value={form.criticality_level} onChange={(e) => setForm((p) => ({ ...p, criticality_level: Number(e.target.value) }))} />
                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editingNode ? `Edit Node: ${editingNode.name}` : 'Edit Node'}
                isOpen={!!editingNode}
                onClose={() => setEditingNode(null)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setEditingNode(null)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="node-edit-form">Save</button>
                    </>
                )}
            >
                <form id="node-edit-form" className="grid gap-3 md:grid-cols-2" onSubmit={updateNode}>
                    <input className="input md:col-span-2" placeholder="Node name" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} />
                    <input className="input" placeholder="Type" value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))} />
                    <input className="input" type="number" min={1} max={5} placeholder="Criticality 1-5" value={editForm.criticality_level} onChange={(e) => setEditForm((p) => ({ ...p, criticality_level: Number(e.target.value) }))} />
                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>
        </section>
    );
}

