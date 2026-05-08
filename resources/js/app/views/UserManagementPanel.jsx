import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';

import { api } from '../api';
import Modal from '../ui/Modal';
import Pagination from '../ui/Pagination';

const emptyCreate = {
    name: '',
    email: '',
    password: '',
    timezone: 'Asia/Jakarta',
    telegram_chat_id: '',
    is_active: true,
    roles: [],
};

const emptyEdit = {
    name: '',
    email: '',
    password: '',
    timezone: 'Asia/Jakarta',
    telegram_chat_id: '',
    is_active: true,
    roles: [],
};

export default function UserManagementPanel({ setError }) {
    const [roles, setRoles] = useState([]);
    const [usersPage, setUsersPage] = useState({ data: [], meta: null });
    const [isLoading, setIsLoading] = useState(false);

    const [q, setQ] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ ...emptyCreate });

    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ ...emptyEdit });

    const filteredLabel = useMemo(() => {
        const total = usersPage.meta?.total ?? usersPage.data.length;
        const query = q.trim();
        if (!query) {
            return `${total} users`;
        }
        return `${total} matching "${query}"`;
    }, [usersPage, q]);

    const loadRoles = async () => {
        try {
            const rolesRes = await api.get('/admin/roles');
            setRoles(rolesRes.data || []);
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to load roles');
        }
    };

    const loadUsers = async (opts = {}) => {
        const nextPage = opts.page ?? page;
        const nextQuery = opts.q ?? q;
        const nextPerPage = opts.per_page ?? perPage;

        setIsLoading(true);
        try {
            const res = await api.get('/admin/users', {
                params: {
                    page: nextPage,
                    per_page: nextPerPage,
                    q: nextQuery.trim() || undefined,
                },
            });

            setUsersPage({
                data: res.data.data || [],
                meta: {
                    current_page: res.data.current_page,
                    from: res.data.from,
                    to: res.data.to,
                    total: res.data.total,
                    last_page: res.data.last_page,
                    per_page: res.data.per_page,
                },
            });

            setError?.('');
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
        loadUsers({ page: 1 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            loadUsers({ page: 1, q });
        }, 250);

        return () => window.clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, perPage]);

    useEffect(() => {
        loadUsers({ page });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const toggleRole = (roleSlug, updater) => {
        updater((prev) => {
            const exists = prev.roles.includes(roleSlug);
            const nextRoles = exists ? prev.roles.filter((slug) => slug !== roleSlug) : [...prev.roles, roleSlug];
            return { ...prev, roles: nextRoles };
        });
    };

    const openCreate = () => {
        setCreateForm({ ...emptyCreate, timezone: 'Asia/Jakarta' });
        setIsCreateOpen(true);
    };

    const createUser = async (event) => {
        event.preventDefault();
        try {
            await api.post('/admin/users', {
                name: createForm.name,
                email: createForm.email,
                password: createForm.password,
                timezone: createForm.timezone,
                telegram_chat_id: (createForm.telegram_chat_id || '').trim() || null,
                is_active: !!createForm.is_active,
                roles: createForm.roles,
            });
            setIsCreateOpen(false);
            setCreateForm({ ...emptyCreate });
            await loadUsers({ page: 1 });
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to create user');
        }
    };

    const openEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            password: '',
            timezone: user.timezone || 'Asia/Jakarta',
            telegram_chat_id: user.telegram_chat_id || '',
            is_active: !!user.is_active,
            roles: (user.roles || []).map((r) => r.slug),
        });
    };

    const updateUser = async (event) => {
        event.preventDefault();
        if (!editingUser) {
            return;
        }

        try {
            const payload = {
                name: editForm.name,
                email: editForm.email,
                timezone: editForm.timezone,
                telegram_chat_id: (editForm.telegram_chat_id || '').trim() || null,
                is_active: !!editForm.is_active,
                roles: editForm.roles,
            };

            if ((editForm.password || '').trim() !== '') {
                payload.password = editForm.password;
            }

            await api.patch(`/admin/users/${editingUser.id}`, payload);
            setEditingUser(null);
            await loadUsers({ page });
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update user');
        }
    };

    const toggleUserActive = async (user) => {
        try {
            await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
            await loadUsers({ page });
        } catch (e) {
            setError?.(e?.response?.data?.message || 'Failed to update user status');
        }
    };

    return (
        <section className="cartel-card cartel-table-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">User Management</div>
                    <div className="cartel-card-sub">Manage accounts, roles, and access. {filteredLabel}.</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    <label className="cartel-search" style={{ width: 280 }}>
                        <span className="cartel-search-icon" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                                <path d="M16.5 16.5 21 21" />
                            </svg>
                        </span>
                        <input
                            className="cartel-search-input"
                            placeholder="Search name/email"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </label>
                    <select className="input" style={{ width: 110 }} value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                    <button className="cartel-btn cartel-btn-strong" type="button" onClick={openCreate}>
                        Add User
                    </button>
                </div>
            </div>

            <div className="cartel-table-wrap">
                <table className="cartel-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Roles</th>
                            <th>Status</th>
                            <th className="cartel-nowrap">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersPage.data.map((user) => (
                            <tr key={user.id}>
                                <td className="cartel-table-strong">{user.name}</td>
                                <td className="cartel-truncate">{user.email}</td>
                                <td>
                                    <div className="role-action-wrap">
                                        {(user.roles || []).length ? (
                                            user.roles.map((role) => (
                                                <span key={`${user.id}-${role.slug}`} className="role-pill">
                                                    {role.slug}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="cartel-badge">none</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    {user.is_active ? (
                                        <span className="cartel-badge">Active</span>
                                    ) : (
                                        <span className="cartel-badge badge-p1">Disabled</span>
                                    )}
                                </td>
                                <td className="cartel-nowrap">
                                    <div className="flex items-center gap-2">
                                        <button className="cartel-btn" type="button" onClick={() => openEdit(user)}>
                                            Edit
                                        </button>
                                        <button className="cartel-btn" type="button" onClick={() => toggleUserActive(user)} disabled={isLoading}>
                                            {user.is_active ? 'Disable' : 'Enable'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {usersPage.data.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="cartel-empty">
                                    {isLoading ? 'Loading...' : 'No users found.'}
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '0 18px 18px' }}>
                <Pagination meta={usersPage.meta} onPageChange={(next) => setPage(next)} />
            </div>

            <Modal
                title="Add User"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="user-create-form">Create</button>
                    </>
                )}
            >
                <form id="user-create-form" className="grid gap-3 md:grid-cols-2" onSubmit={createUser}>
                    <input className="input md:col-span-2" placeholder="Full name" required value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Email" type="email" required value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Password (min 10 chars)" type="password" required value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} />
                    <input className="input" placeholder="Timezone" value={createForm.timezone} onChange={(e) => setCreateForm((p) => ({ ...p, timezone: e.target.value }))} />
                    <input className="input" placeholder="Telegram chat id (optional)" value={createForm.telegram_chat_id} onChange={(e) => setCreateForm((p) => ({ ...p, telegram_chat_id: e.target.value }))} />

                    <div className="md:col-span-2">
                        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Roles</div>
                        <div className="role-action-wrap">
                            {roles.map((role) => (
                                <button
                                    key={`create-${role.slug}`}
                                    type="button"
                                    className={clsx('role-btn', createForm.roles.includes(role.slug) && 'role-btn-active')}
                                    onClick={() => toggleRole(role.slug, setCreateForm)}
                                >
                                    {role.slug}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={createForm.is_active} onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editingUser ? `Edit User: ${editingUser.email}` : 'Edit User'}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                footer={(
                    <>
                        <button className="cartel-btn" type="button" onClick={() => setEditingUser(null)}>Cancel</button>
                        <button className="cartel-btn cartel-btn-strong" type="submit" form="user-edit-form">Save</button>
                    </>
                )}
            >
                <form id="user-edit-form" className="grid gap-3 md:grid-cols-2" onSubmit={updateUser}>
                    <input className="input md:col-span-2" placeholder="Full name" required value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Email" type="email" required value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} />
                    <input className="input md:col-span-2" placeholder="Reset password (optional)" type="password" value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} />
                    <input className="input" placeholder="Timezone" value={editForm.timezone} onChange={(e) => setEditForm((p) => ({ ...p, timezone: e.target.value }))} />
                    <input className="input" placeholder="Telegram chat id (optional)" value={editForm.telegram_chat_id} onChange={(e) => setEditForm((p) => ({ ...p, telegram_chat_id: e.target.value }))} />

                    <div className="md:col-span-2">
                        <div className="text-sm font-bold mb-2" style={{ color: 'var(--text-main)' }}>Roles</div>
                        <div className="role-action-wrap">
                            {roles.map((role) => (
                                <button
                                    key={`edit-${role.slug}`}
                                    type="button"
                                    className={clsx('role-btn', editForm.roles.includes(role.slug) && 'role-btn-active')}
                                    onClick={() => toggleRole(role.slug, setEditForm)}
                                >
                                    {role.slug}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="toggle-line md:col-span-2">
                        <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))} />
                        Active
                    </label>
                </form>
            </Modal>
        </section>
    );
}

