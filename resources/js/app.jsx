import './bootstrap';
import '../css/app.css';
import axios from 'axios';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
    },
});

const statusLabels = {
    new: 'New',
    acknowledged: 'Acknowledged',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
    escalated: 'Escalated',
};

const columnsOrder = ['new', 'acknowledged', 'in_progress', 'resolved', 'closed', 'escalated'];

const priorityClass = {
    P1: 'bg-red-500/20 text-red-200 ring-red-400/40',
    P2: 'bg-orange-500/20 text-orange-200 ring-orange-400/40',
    P3: 'bg-yellow-500/20 text-yellow-200 ring-yellow-400/40',
    P4: 'bg-sky-500/20 text-sky-200 ring-sky-400/40',
    P5: 'bg-emerald-500/20 text-emerald-200 ring-emerald-400/40',
};

function formatTimer(deadline) {
    if (!deadline) {
        return 'n/a';
    }

    const diffMs = new Date(deadline).getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const h = Math.floor(abs / 3600000);
    const m = Math.floor((abs % 3600000) / 60000);
    const s = Math.floor((abs % 60000) / 1000);
    const text = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

    return diffMs < 0 ? `-${text}` : text;
}

function hasPermission(profile, permission) {
    return (profile?.permissions || []).includes(permission);
}

function App() {
    const [token, setToken] = useState(() => localStorage.getItem('sarah_token') || '');
    const [theme, setTheme] = useState(() => localStorage.getItem('sarah_theme') || 'dark');
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [profile, setProfile] = useState(null);
    const [board, setBoard] = useState({ columns: {}, meta: {} });
    const [stats, setStats] = useState(null);
    const [integrations, setIntegrations] = useState({ webhook_sources: [], telegram: null });
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [menu, setMenu] = useState('dashboard');
    const [isLoading, setIsLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        timezone: 'Asia/Jakarta',
        is_active: true,
        roles: [],
    });

    const sensors = useSensors(useSensor(PointerSensor));

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('sarah_theme', theme);
    }, [theme]);

    useEffect(() => {
        if (!token) {
            return;
        }

        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        localStorage.setItem('sarah_token', token);

        const bootstrap = async () => {
            await fetchBaseData();
            await fetchConditionalData();
        };

        bootstrap();

        const id = window.setInterval(() => {
            fetchBaseData();
        }, 15000);

        return () => window.clearInterval(id);
    }, [token]);

    useEffect(() => {
        if (!token) {
            return;
        }

        fetchConditionalData();
    }, [menu, profile?.id]);

    const fetchBaseData = async () => {
        try {
            const [me, boardRes, statsRes, integrationRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/tickets/board'),
                api.get('/dashboard/stats'),
                api.get('/integrations'),
            ]);

            setProfile(me.data);
            setBoard(boardRes.data);
            setStats(statsRes.data);
            setIntegrations(integrationRes.data);
            setError('');
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
            } else {
                setError(e?.response?.data?.message || 'Failed to fetch dashboard data');
            }
        }
    };

    const fetchConditionalData = async () => {
        if (menu === 'users' && hasPermission(profile, 'users.manage')) {
            const [usersRes, rolesRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/roles')]);
            setUsers(usersRes.data.data || []);
            setRoles(rolesRes.data || []);
        }

        if (menu === 'audit' && hasPermission(profile, 'audit.view')) {
            const logsRes = await api.get('/admin/audit-logs');
            setAuditLogs(logsRes.data.data || []);
        }
    };

    const login = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password,
                device_name: 'sarah-dashboard',
            });
            setToken(response.data.token);
            setCredentials({ email: '', password: '' });
            setError('');
        } catch (e) {
            setError(e?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/auth/logout');
            }
        } catch (_e) {
            // ignore
        }

        localStorage.removeItem('sarah_token');
        delete api.defaults.headers.common.Authorization;
        setToken('');
        setProfile(null);
        setBoard({ columns: {}, meta: {} });
        setStats(null);
        setIntegrations({ webhook_sources: [], telegram: null });
        setUsers([]);
        setRoles([]);
        setAuditLogs([]);
        setMenu('dashboard');
    };

    const canUpdateTicket = useMemo(() => hasPermission(profile, 'tickets.update'), [profile]);
    const canManageUsers = useMemo(() => hasPermission(profile, 'users.manage'), [profile]);
    const canSeeAudit = useMemo(() => hasPermission(profile, 'audit.view'), [profile]);

    const updateStatus = async (ticketId, status) => {
        if (!canUpdateTicket) {
            return;
        }

        await api.patch(`/tickets/${ticketId}/status`, { status });
        await fetchBaseData();
    };

    const onDragEnd = async (event) => {
        const ticketId = event.active?.id;
        const toColumn = event.over?.id;

        if (!ticketId || !toColumn || !canUpdateTicket || !columnsOrder.includes(toColumn)) {
            return;
        }

        const ticket = Object.values(board.columns || {})
            .flat()
            .find((item) => item.id === Number(ticketId));

        if (!ticket || ticket.status === toColumn) {
            return;
        }

        try {
            await updateStatus(ticket.id, toColumn);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update ticket status');
        }
    };

    const createUser = async (event) => {
        event.preventDefault();

        try {
            await api.post('/admin/users', newUser);
            setNewUser({
                name: '',
                email: '',
                password: '',
                timezone: 'Asia/Jakarta',
                is_active: true,
                roles: [],
            });
            await fetchConditionalData();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to create user');
        }
    };

    const toggleUserActive = async (user) => {
        try {
            await api.patch(`/admin/users/${user.id}`, {
                is_active: !user.is_active,
            });
            await fetchConditionalData();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update user');
        }
    };

    const setUserRole = async (user, roleSlug) => {
        const hasRoleNow = user.roles.some((role) => role.slug === roleSlug);
        const roleSlugs = hasRoleNow ? user.roles.filter((role) => role.slug !== roleSlug).map((role) => role.slug) : [...user.roles.map((role) => role.slug), roleSlug];

        try {
            await api.patch(`/admin/users/${user.id}`, {
                roles: roleSlugs,
            });
            await fetchConditionalData();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update role');
        }
    };

    if (!token) {
        return (
            <main className="login-shell">
                <div className="login-card">
                    <h1 className="text-3xl font-bold">SARAH Command Center</h1>
                    <p className="mt-2 text-sm opacity-80">Smart Automated Response & Alerting Hub</p>
                    <form onSubmit={login} className="mt-8 space-y-4">
                        <input
                            type="email"
                            required
                            placeholder="Email"
                            className="input"
                            value={credentials.email}
                            onChange={(e) => setCredentials((v) => ({ ...v, email: e.target.value }))}
                        />
                        <input
                            type="password"
                            required
                            placeholder="Password"
                            className="input"
                            value={credentials.password}
                            onChange={(e) => setCredentials((v) => ({ ...v, password: e.target.value }))}
                        />
                        <button className="btn-primary w-full" disabled={isLoading} type="submit">
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                    <div className="mt-5 rounded-xl border border-white/20 bg-white/5 p-3 text-xs">
                        <p className="font-semibold">Dev Login Super Admin</p>
                        <p>Email: superadmin@sarah.local</p>
                        <p>Password: S4rahSecure!2026</p>
                    </div>
                    {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
                </div>
            </main>
        );
    }

    return (
        <main className="dashboard-shell">
            <header className="dashboard-header">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Phoenix Dashboard</h1>
                    <p className="text-sm opacity-80">NOC Incident Orchestration for SARAH</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-secondary"
                        onClick={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))}
                        type="button"
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'} Mode
                    </button>
                    <button className="btn-secondary" onClick={logout} type="button">
                        Logout
                    </button>
                </div>
            </header>

            <section className="menu-tabs">
                <button className={clsx('menu-tab', menu === 'dashboard' && 'menu-tab-active')} onClick={() => setMenu('dashboard')} type="button">
                    Dashboard
                </button>
                <button className={clsx('menu-tab', menu === 'tickets' && 'menu-tab-active')} onClick={() => setMenu('tickets')} type="button">
                    Ticket Board
                </button>
                <button className={clsx('menu-tab', menu === 'integrations' && 'menu-tab-active')} onClick={() => setMenu('integrations')} type="button">
                    Integrations
                </button>
                {canManageUsers ? (
                    <button className={clsx('menu-tab', menu === 'users' && 'menu-tab-active')} onClick={() => setMenu('users')} type="button">
                        User Management
                    </button>
                ) : null}
                {canSeeAudit ? (
                    <button className={clsx('menu-tab', menu === 'audit' && 'menu-tab-active')} onClick={() => setMenu('audit')} type="button">
                        Audit Log
                    </button>
                ) : null}
            </section>

            {error ? <p className="mb-3 mt-3 rounded-xl bg-rose-500/15 px-4 py-2 text-sm text-rose-200">{error}</p> : null}

            {menu === 'dashboard' ? (
                <section className="stats-grid">
                    <StatCard label="Open Tickets" value={stats?.open_tickets ?? 0} />
                    <StatCard label="P1 Open" value={stats?.p1_open ?? 0} />
                    <StatCard label="Response Breached" value={stats?.sla_response_breached ?? 0} />
                    <StatCard label="Resolution Breached" value={stats?.sla_resolution_breached ?? 0} />
                    <StatCard label="Closed Today" value={stats?.closed_today ?? 0} />
                </section>
            ) : null}

            {menu === 'tickets' ? (
                <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                    <section className="kanban-grid mt-3">
                        {columnsOrder.map((status) => (
                            <KanbanColumn
                                id={status}
                                key={status}
                                title={statusLabels[status]}
                                items={board.columns?.[status] || []}
                                canUpdate={canUpdateTicket}
                                onQuickStatus={updateStatus}
                            />
                        ))}
                    </section>
                </DndContext>
            ) : null}

            {menu === 'integrations' ? <IntegrationPanel integrations={integrations} /> : null}

            {menu === 'users' && canManageUsers ? (
                <UserManagementPanel
                    users={users}
                    roles={roles}
                    newUser={newUser}
                    setNewUser={setNewUser}
                    createUser={createUser}
                    toggleUserActive={toggleUserActive}
                    setUserRole={setUserRole}
                />
            ) : null}

            {menu === 'audit' && canSeeAudit ? <AuditPanel logs={auditLogs} /> : null}
        </main>
    );
}

function StatCard({ label, value }) {
    return (
        <article className="stat-card">
            <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
            <h2 className="mt-2 text-2xl font-bold">{value}</h2>
        </article>
    );
}

function KanbanColumn({ id, title, items, canUpdate, onQuickStatus }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <article ref={setNodeRef} className="kanban-column" id={id}>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{title}</h3>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{items.length}</span>
            </div>
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="space-y-3" id={id}>
                    {items.map((ticket) => (
                        <TicketCard key={ticket.id} ticket={ticket} canUpdate={canUpdate} onQuickStatus={onQuickStatus} />
                    ))}
                </div>
            </SortableContext>
        </article>
    );
}

function TicketCard({ ticket, canUpdate, onQuickStatus }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: ticket.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const deadline = ticket.acknowledged_at ? ticket.sla_resolution_deadline_at : ticket.sla_response_deadline_at;
    const overdue = deadline && new Date(deadline).getTime() < Date.now();

    return (
        <div ref={setNodeRef} style={style} className="ticket-card" {...attributes} {...listeners}>
            <div className="mb-2 flex items-start justify-between gap-2">
                <span className={clsx('inline-flex rounded-full px-2 py-0.5 text-xs ring-1', priorityClass[ticket.priority] || priorityClass.P3)}>
                    {ticket.priority}
                </span>
                <span className="text-xs opacity-70">{ticket.ticket_code}</span>
            </div>

            <h4 className="text-sm font-semibold leading-tight">{ticket.title}</h4>
            <p className="mt-2 line-clamp-2 text-xs opacity-80">{ticket.description || 'No description provided'}</p>

            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="opacity-80">{ticket.node_name || '-'}</span>
                <span className={clsx('font-mono', overdue ? 'text-rose-300' : 'text-emerald-300')}>{formatTimer(deadline)}</span>
            </div>

            {canUpdate ? (
                <div className="mt-3 flex gap-2">
                    {ticket.status !== 'acknowledged' ? (
                        <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'acknowledged')}>
                            Ack
                        </button>
                    ) : null}
                    {ticket.status !== 'in_progress' ? (
                        <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'in_progress')}>
                            Start
                        </button>
                    ) : null}
                    {ticket.status !== 'resolved' ? (
                        <button className="btn-chip" type="button" onClick={() => onQuickStatus(ticket.id, 'resolved')}>
                            Resolve
                        </button>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function IntegrationPanel({ integrations }) {
    return (
        <section className="panel mt-3">
            <h2 className="text-lg font-bold">Monitoring Integrations</h2>
            <p className="mt-1 text-sm opacity-80">Webhook endpoint untuk Zabbix/Grafana/Observium sudah aktif dan memakai signature HMAC.</p>
            <div className="mt-4 overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Source</th>
                            <th>Slug</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {integrations.webhook_sources.map((source) => (
                            <tr key={source.slug}>
                                <td>{source.name}</td>
                                <td className="font-mono text-xs">{source.slug}</td>
                                <td>{source.is_active ? 'Active' : 'Inactive'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3 text-xs">
                <p className="font-semibold">Telegram Webhook Endpoint</p>
                <p className="mt-1 font-mono">{integrations.telegram?.webhook_url || '-'}</p>
                <p className="mt-1">Secret Header: {integrations.telegram?.secret_header || '-'}</p>
            </div>
        </section>
    );
}

function UserManagementPanel({ users, roles, newUser, setNewUser, createUser, toggleUserActive, setUserRole }) {
    return (
        <section className="panel mt-3 space-y-5">
            <h2 className="text-lg font-bold">User Management</h2>

            <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-3" onSubmit={createUser}>
                <input className="input" placeholder="Full name" required value={newUser.name} onChange={(e) => setNewUser((v) => ({ ...v, name: e.target.value }))} />
                <input className="input" placeholder="Email" required type="email" value={newUser.email} onChange={(e) => setNewUser((v) => ({ ...v, email: e.target.value }))} />
                <input className="input" placeholder="Password" required type="password" minLength={10} value={newUser.password} onChange={(e) => setNewUser((v) => ({ ...v, password: e.target.value }))} />
                <input className="input" placeholder="Timezone" value={newUser.timezone} onChange={(e) => setNewUser((v) => ({ ...v, timezone: e.target.value }))} />
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={newUser.is_active} onChange={(e) => setNewUser((v) => ({ ...v, is_active: e.target.checked }))} />
                    Active User
                </label>
                <div className="flex flex-wrap gap-2">
                    {roles.map((role) => {
                        const checked = newUser.roles.includes(role.slug);
                        return (
                            <label key={role.slug} className="inline-flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-xs">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                        setNewUser((v) => ({
                                            ...v,
                                            roles: e.target.checked ? [...v.roles, role.slug] : v.roles.filter((slug) => slug !== role.slug),
                                        }));
                                    }}
                                />
                                {role.name}
                            </label>
                        );
                    })}
                </div>
                <button className="btn-primary md:col-span-2 xl:col-span-3" type="submit">
                    Create User
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Roles</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.is_active ? 'Active' : 'Disabled'}</td>
                                <td>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => (
                                            <button
                                                key={`${user.id}-${role.slug}`}
                                                className={clsx('btn-chip', user.roles.some((v) => v.slug === role.slug) && 'bg-sky-500/20')}
                                                onClick={() => setUserRole(user, role.slug)}
                                                type="button"
                                            >
                                                {role.slug}
                                            </button>
                                        ))}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-chip" onClick={() => toggleUserActive(user)} type="button">
                                        {user.is_active ? 'Disable' : 'Enable'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function AuditPanel({ logs }) {
    return (
        <section className="panel mt-3">
            <h2 className="text-lg font-bold">Audit Log</h2>
            <div className="mt-3 overflow-x-auto">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Object</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className="text-xs">{new Date(log.created_at).toLocaleString()}</td>
                                <td>{log.user?.name || 'system'}</td>
                                <td>{log.action}</td>
                                <td>{log.auditable_type}#{log.auditable_id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

createRoot(document.getElementById('app')).render(<App />);
