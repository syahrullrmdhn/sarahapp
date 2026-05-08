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
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">User management</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Manage accounts, roles, and access. {filteredLabel}.
                </p>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 border border-transparent focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all dark:bg-slate-900 dark:text-slate-300 dark:focus-within:bg-slate-900 dark:focus-within:border-slate-700 dark:focus-within:ring-slate-800">
                            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                                <path d="M16.5 16.5 21 21" />
                            </svg>
                            <input
                                className="w-64 bg-transparent outline-none placeholder:text-slate-400"
                                placeholder="Search name/email"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                        </label>
                        <select
                            className="h-[40px] rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            value={perPage}
                            onChange={(e) => setPerPage(Number(e.target.value))}
                            aria-label="Rows per page"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                        type="button"
                        onClick={openCreate}
                    >
                        Add user
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/40">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Name</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Email</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Roles</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Status</th>
                                <th className="px-6 py-3 text-xs font-medium text-slate-500 dark:text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {usersPage.data.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-950/30">
                                    <td className="px-6 py-3 text-slate-900 dark:text-slate-100 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-3 text-slate-500 dark:text-slate-400">{user.email}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            {(user.roles || []).length ? (
                                                user.roles.map((role) => (
                                                    <span key={`${user.id}-${role.slug}`} className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                        {role.slug}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200">
                                                    none
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {user.is_active ? (
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
                                                onClick={() => openEdit(user)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
                                                type="button"
                                                onClick={() => toggleUserActive(user)}
                                                disabled={isLoading}
                                            >
                                                {user.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {usersPage.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-sm text-slate-500 dark:text-slate-400">
                                        {isLoading ? 'Loading...' : 'No users found.'}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 pb-5">
                    <Pagination meta={usersPage.meta} onPageChange={(next) => setPage(next)} />
                </div>
            </section>

            <Modal
                title="Add user"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={(
                    <>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                            type="submit"
                            form="user-create-form"
                        >
                            Create
                        </button>
                    </>
                )}
            >
                <form id="user-create-form" className="grid gap-4 md:grid-cols-2" onSubmit={createUser}>
                    <Field label="Full name" required className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            required
                            value={createForm.name}
                            onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                        />
                    </Field>
                    <Field label="Email" required className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            type="email"
                            required
                            value={createForm.email}
                            onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                        />
                    </Field>
                    <Field label="Password (min 10 chars)" required className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            type="password"
                            required
                            value={createForm.password}
                            onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                        />
                    </Field>
                    <Field label="Timezone">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={createForm.timezone}
                            onChange={(e) => setCreateForm((p) => ({ ...p, timezone: e.target.value }))}
                        />
                    </Field>
                    <Field label="Telegram chat id (optional)">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={createForm.telegram_chat_id}
                            onChange={(e) => setCreateForm((p) => ({ ...p, telegram_chat_id: e.target.value }))}
                        />
                    </Field>

                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Roles</div>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <button
                                    key={`create-${role.slug}`}
                                    type="button"
                                    className={clsx(
                                        'rounded-full border px-3 py-2 text-sm transition-colors',
                                        createForm.roles.includes(role.slug)
                                            ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
                                    )}
                                    onClick={() => toggleRole(role.slug, setCreateForm)}
                                >
                                    {role.slug}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={createForm.is_active}
                            onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))}
                        />
                        Active
                    </label>
                </form>
            </Modal>

            <Modal
                title={editingUser ? `Edit user: ${editingUser.email}` : 'Edit user'}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                footer={(
                    <>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setEditingUser(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-[0_10px_20px_-10px_rgba(37,99,235,0.55)]"
                            type="submit"
                            form="user-edit-form"
                        >
                            Save
                        </button>
                    </>
                )}
            >
                <form id="user-edit-form" className="grid gap-4 md:grid-cols-2" onSubmit={updateUser}>
                    <Field label="Full name" required className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            required
                            value={editForm.name}
                            onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        />
                    </Field>
                    <Field label="Email" required className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            type="email"
                            required
                            value={editForm.email}
                            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                        />
                    </Field>
                    <Field label="Reset password (optional)" className="md:col-span-2">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            type="password"
                            value={editForm.password}
                            onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
                        />
                    </Field>
                    <Field label="Timezone">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={editForm.timezone}
                            onChange={(e) => setEditForm((p) => ({ ...p, timezone: e.target.value }))}
                        />
                    </Field>
                    <Field label="Telegram chat id (optional)">
                        <input
                            className="h-[44px] w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                            value={editForm.telegram_chat_id}
                            onChange={(e) => setEditForm((p) => ({ ...p, telegram_chat_id: e.target.value }))}
                        />
                    </Field>

                    <div className="md:col-span-2">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Roles</div>
                        <div className="flex flex-wrap gap-2">
                            {roles.map((role) => (
                                <button
                                    key={`edit-${role.slug}`}
                                    type="button"
                                    className={clsx(
                                        'rounded-full border px-3 py-2 text-sm transition-colors',
                                        editForm.roles.includes(role.slug)
                                            ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
                                    )}
                                    onClick={() => toggleRole(role.slug, setEditForm)}
                                >
                                    {role.slug}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <input
                            type="checkbox"
                            checked={editForm.is_active}
                            onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                        />
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

