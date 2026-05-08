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
    P1: 'badge-p1',
    P2: 'badge-p2',
    P3: 'badge-p3',
    P4: 'badge-p4',
    P5: 'badge-p5',
};

const secondarySidebarItems = [
    { key: 'tickets', label: 'Incident Kanban' },
    { key: 'integrations', label: 'Monitoring Integrations' },
    { key: 'users', label: 'User Management', permission: 'users.manage' },
    { key: 'audit', label: 'Audit Log', permission: 'audit.view' },
];

function hasPermission(profile, permission) {
    return (profile?.permissions || []).includes(permission);
}

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

function App() {
    const [token, setToken] = useState(() => localStorage.getItem('sarah_token') || '');
    const [theme, setTheme] = useState(() => localStorage.getItem('sarah_theme') || 'light');
    const [menu, setMenu] = useState('dashboard');
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [profile, setProfile] = useState(null);
    const [board, setBoard] = useState({ columns: {}, meta: {} });
    const [stats, setStats] = useState(null);
    const [integrations, setIntegrations] = useState({ webhook_sources: [], telegram: null });
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);

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

        const boot = async () => {
            await refreshBase();
        };

        boot();

        const intervalId = window.setInterval(() => {
            refreshBase();
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [token]);

    useEffect(() => {
        if (!token || !profile) {
            return;
        }

        refreshContextual(menu);
    }, [menu, token, profile?.id]);

    const refreshBase = async () => {
        try {
            const [meRes, boardRes, statsRes, integrationRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/tickets/board'),
                api.get('/dashboard/stats'),
                api.get('/integrations'),
            ]);

            const nextProfile = meRes.data;
            setProfile(nextProfile);
            setBoard(boardRes.data);
            setStats(statsRes.data);
            setIntegrations(integrationRes.data);
            setError('');

            await refreshContextual(menu, nextProfile);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }

            setError(e?.response?.data?.message || 'Failed to fetch dashboard data');
        }
    };

    const refreshContextual = async (nextMenu, userProfile = profile) => {
        try {
            if (nextMenu === 'users' && hasPermission(userProfile, 'users.manage')) {
                const [usersRes, rolesRes] = await Promise.all([api.get('/admin/users'), api.get('/admin/roles')]);
                setUsers(usersRes.data.data || []);
                setRoles(rolesRes.data || []);
            }

            if (nextMenu === 'audit' && hasPermission(userProfile, 'audit.view')) {
                const auditRes = await api.get('/admin/audit-logs');
                setAuditLogs(auditRes.data.data || []);
            }
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to fetch contextual data');
        }
    };

    const login = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        try {
            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password,
                device_name: 'sarah-phoenix-ui',
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
        setMenu('dashboard');
        setProfile(null);
        setBoard({ columns: {}, meta: {} });
        setStats(null);
        setIntegrations({ webhook_sources: [], telegram: null });
        setUsers([]);
        setRoles([]);
        setAuditLogs([]);
    };

    const canUpdateTicket = useMemo(() => hasPermission(profile, 'tickets.update'), [profile]);
    const canManageUsers = useMemo(() => hasPermission(profile, 'users.manage'), [profile]);
    const canViewAudit = useMemo(() => hasPermission(profile, 'audit.view'), [profile]);

    const updateStatus = async (ticketId, status) => {
        if (!canUpdateTicket) {
            return;
        }

        try {
            await api.patch(`/tickets/${ticketId}/status`, { status });
            await refreshBase();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update ticket status');
        }
    };

    const onDragEnd = async (event) => {
        const ticketId = event.active?.id;
        const toColumn = event.over?.id;

        if (!ticketId || !toColumn || !columnsOrder.includes(toColumn)) {
            return;
        }

        const ticket = Object.values(board.columns || {})
            .flat()
            .find((item) => item.id === Number(ticketId));

        if (!ticket || ticket.status === toColumn) {
            return;
        }

        await updateStatus(ticket.id, toColumn);
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
            await refreshContextual('users');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to create user');
        }
    };

    const toggleUserActive = async (user) => {
        try {
            await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active });
            await refreshContextual('users');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update user status');
        }
    };

    const setUserRole = async (user, roleSlug) => {
        const isAssigned = user.roles.some((role) => role.slug === roleSlug);
        const nextRoles = isAssigned ? user.roles.filter((role) => role.slug !== roleSlug).map((role) => role.slug) : [...user.roles.map((role) => role.slug), roleSlug];

        try {
            await api.patch(`/admin/users/${user.id}`, { roles: nextRoles });
            await refreshContextual('users');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to update user role');
        }
    };

    const boardCounts = useMemo(() => {
        const columns = board.columns || {};
        return {
            total: Object.values(columns).flat().length,
            new: (columns.new || []).length,
            acknowledged: (columns.acknowledged || []).length,
            escalated: (columns.escalated || []).length,
            closed: (columns.closed || []).length,
        };
    }, [board]);

    const responseCompliance = useMemo(() => {
        const open = Math.max(1, stats?.open_tickets || 1);
        const breach = stats?.sla_response_breached || 0;
        return Math.max(0, Math.min(100, Math.round(((open - breach) / open) * 100)));
    }, [stats]);

    if (!token) {
        return (
            <main className="auth-wrap">
                <div className="auth-panel">
                    <div className="brand-row">
                        <div className="brand-icon">S</div>
                        <div>
                            <h1 className="auth-title">SARAH Phoenix</h1>
                            <p className="auth-subtitle">Smart Automated Response & Alerting Hub</p>
                        </div>
                    </div>

                    <form className="space-y-3" onSubmit={login}>
                        <input
                            className="input"
                            type="email"
                            required
                            placeholder="Email"
                            value={credentials.email}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                        />
                        <input
                            className="input"
                            type="password"
                            required
                            placeholder="Password"
                            value={credentials.password}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                        />
                        <button className="btn-primary w-full" type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="dev-cred-box">
                        <div className="dev-cred-title">Super Admin (Dev)</div>
                        <div>superadmin@sarah.local</div>
                        <div>S4rahSecure!2026</div>
                    </div>

                    {error ? <p className="auth-error">{error}</p> : null}
                </div>
            </main>
        );
    }

    return (
        <div className="phoenix-shell">
            <aside className="phoenix-sidebar">
                <div className="sidebar-logo">
                    {theme === 'light' ? (
                        <img
                            src="/Unique Command Center Logo for SARAH.png"
                            alt="SARAH Command Center"
                            className="sidebar-logo-image"
                        />
                    ) : (
                        <>
                            <span className="logo-flame">✦</span>
                            <span className="logo-text">sarah</span>
                        </>
                    )}
                </div>

                <nav className="sidebar-section">
                    <p className="sidebar-label">HOME</p>
                    <button type="button" className={clsx('sidebar-item', menu === 'dashboard' && 'sidebar-item-active')} onClick={() => setMenu('dashboard')}>
                        Ecommerce
                    </button>
                </nav>

                <nav className="sidebar-section">
                    <p className="sidebar-label">APPS</p>
                    {secondarySidebarItems
                        .filter((item) => !item.permission || hasPermission(profile, item.permission))
                        .map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                className={clsx('sidebar-item', menu === item.key && 'sidebar-item-active')}
                                onClick={() => setMenu(item.key)}
                            >
                                {item.label}
                            </button>
                        ))}
                </nav>

                <div className="sidebar-profile">
                    <div className="avatar-circle">{(profile?.name || 'U').slice(0, 1).toUpperCase()}</div>
                    <div>
                        <div className="profile-name">{profile?.name}</div>
                        <div className="profile-role">{(profile?.roles || []).join(', ') || 'user'}</div>
                    </div>
                </div>
            </aside>

            <section className="phoenix-main">
                <header className="phoenix-topbar">
                    <div className="topbar-search">Search incidents, users, node...</div>
                    <div className="topbar-actions">
                        <button className="icon-btn" onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} type="button">
                            {theme === 'light' ? '☾' : '☀'}
                        </button>
                        <button className="icon-btn" type="button">⎋</button>
                        <button className="icon-btn" type="button" onClick={logout}>↦</button>
                    </div>
                </header>

                <main className="phoenix-content">
                    {error ? <div className="error-banner">{error}</div> : null}

                    {menu === 'dashboard' ? (
                        <DashboardView
                            board={board}
                            boardCounts={boardCounts}
                            stats={stats}
                            responseCompliance={responseCompliance}
                            setMenu={setMenu}
                        />
                    ) : null}

                    {menu === 'tickets' ? (
                        <TicketBoardView
                            board={board}
                            canUpdateTicket={canUpdateTicket}
                            onDragEnd={onDragEnd}
                            sensors={sensors}
                            updateStatus={updateStatus}
                        />
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

                    {menu === 'audit' && canViewAudit ? <AuditPanel logs={auditLogs} /> : null}
                </main>
            </section>
        </div>
    );
}

function DashboardView({ board, boardCounts, stats, responseCompliance, setMenu }) {
    const completionRate = boardCounts.total > 0 ? Math.round((boardCounts.closed / boardCounts.total) * 100) : 0;

    return (
        <div className="dashboard-grid">
            <section className="hero-panel panel-elevated">
                <div>
                    <h2 className="hero-title">Incident Operations Dashboard</h2>
                    <p className="hero-subtitle">Here is the real-time pulse across your NOC operation.</p>
                </div>

                <div className="hero-badges">
                    <QuickBadge color="green" title={`${boardCounts.new} new incidents`} subtitle="Awaiting triage" />
                    <QuickBadge color="amber" title={`${boardCounts.acknowledged} acknowledged`} subtitle="In active handling" />
                    <QuickBadge color="red" title={`${boardCounts.escalated} escalated`} subtitle="Need lead attention" />
                </div>

                <div className="hero-chart-card">
                    <div className="hero-chart-head">
                        <h3>Total incidents</h3>
                        <button className="btn-chip" type="button" onClick={() => setMenu('tickets')}>
                            Open Ticket Board
                        </button>
                    </div>
                    <MiniTrendChart />
                </div>
            </section>

            <section className="metric-card panel-elevated">
                <div className="metric-head">
                    <h3>Total open</h3>
                    <span className="metric-pill">Last 24h</span>
                </div>
                <div className="metric-value">{stats?.open_tickets ?? 0}</div>
                <BarPulse valueA={boardCounts.new} valueB={boardCounts.acknowledged} valueC={boardCounts.escalated} />
                <div className="metric-legend">
                    <span>New</span>
                    <span>Acknowledged</span>
                    <span>Escalated</span>
                </div>
            </section>

            <section className="metric-card panel-elevated">
                <div className="metric-head">
                    <h3>Response breach</h3>
                    <span className="metric-pill negative">{stats?.sla_response_breached ?? 0}</span>
                </div>
                <div className="metric-value">{responseCompliance}%</div>
                <SimpleSparkline />
                <p className="metric-note">Current response SLA compliance</p>
            </section>

            <section className="metric-card panel-elevated">
                <h3>SLA Compliance</h3>
                <Donut value={responseCompliance} caption="Response SLA" />
            </section>

            <section className="metric-card panel-elevated">
                <h3>Completion Rate</h3>
                <Donut value={completionRate} caption="Closed tickets" />
            </section>
        </div>
    );
}

function TicketBoardView({ board, canUpdateTicket, onDragEnd, sensors, updateStatus }) {
    return (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <section className="ticket-board">
                {columnsOrder.map((status) => (
                    <KanbanColumn
                        key={status}
                        id={status}
                        title={statusLabels[status]}
                        items={board.columns?.[status] || []}
                        canUpdate={canUpdateTicket}
                        onQuickStatus={updateStatus}
                    />
                ))}
            </section>
        </DndContext>
    );
}

function IntegrationPanel({ integrations }) {
    return (
        <section className="panel-elevated detail-panel">
            <h2>Integrations</h2>
            <p>Monitoring webhook receiver is active and secured with HMAC signature verification.</p>

            <div className="table-wrap">
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
                                <td className="mono">{source.slug}</td>
                                <td>{source.is_active ? 'Active' : 'Inactive'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="integration-block">
                <div className="integration-title">Telegram Webhook Endpoint</div>
                <div className="mono">{integrations.telegram?.webhook_url || '-'}</div>
                <div>Secret header: {integrations.telegram?.secret_header || '-'}</div>
            </div>
        </section>
    );
}

function UserManagementPanel({ users, roles, newUser, setNewUser, createUser, toggleUserActive, setUserRole }) {
    return (
        <section className="panel-elevated detail-panel">
            <h2>User Management</h2>

            <form className="user-form" onSubmit={createUser}>
                <input className="input" placeholder="Full name" required value={newUser.name} onChange={(event) => setNewUser((prev) => ({ ...prev, name: event.target.value }))} />
                <input className="input" placeholder="Email" required type="email" value={newUser.email} onChange={(event) => setNewUser((prev) => ({ ...prev, email: event.target.value }))} />
                <input className="input" placeholder="Password" required minLength={10} type="password" value={newUser.password} onChange={(event) => setNewUser((prev) => ({ ...prev, password: event.target.value }))} />
                <input className="input" placeholder="Timezone" value={newUser.timezone} onChange={(event) => setNewUser((prev) => ({ ...prev, timezone: event.target.value }))} />
                <label className="toggle-line">
                    <input type="checkbox" checked={newUser.is_active} onChange={(event) => setNewUser((prev) => ({ ...prev, is_active: event.target.checked }))} />
                    Active user
                </label>
                <div className="role-select-wrap">
                    {roles.map((role) => {
                        const checked = newUser.roles.includes(role.slug);

                        return (
                            <label key={role.slug} className="role-pill">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(event) => {
                                        setNewUser((prev) => ({
                                            ...prev,
                                            roles: event.target.checked ? [...prev.roles, role.slug] : prev.roles.filter((slug) => slug !== role.slug),
                                        }));
                                    }}
                                />
                                {role.name}
                            </label>
                        );
                    })}
                </div>
                <button className="btn-primary" type="submit">Create User</button>
            </form>

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Roles</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.is_active ? 'Active' : 'Disabled'}</td>
                                <td>
                                    <div className="role-action-wrap">
                                        {roles.map((role) => {
                                            const isAssigned = user.roles.some((item) => item.slug === role.slug);

                                            return (
                                                <button
                                                    key={`${user.id}-${role.slug}`}
                                                    type="button"
                                                    className={clsx('role-btn', isAssigned && 'role-btn-active')}
                                                    onClick={() => setUserRole(user, role.slug)}
                                                >
                                                    {role.slug}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </td>
                                <td>
                                    <button className="btn-chip" type="button" onClick={() => toggleUserActive(user)}>
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
        <section className="panel-elevated detail-panel">
            <h2>Audit Log</h2>
            <div className="table-wrap">
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
                                <td>{new Date(log.created_at).toLocaleString()}</td>
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

function QuickBadge({ color, title, subtitle }) {
    return (
        <div className={clsx('quick-badge', `quick-badge-${color}`)}>
            <div className="quick-dot" />
            <div>
                <div className="quick-title">{title}</div>
                <div className="quick-subtitle">{subtitle}</div>
            </div>
        </div>
    );
}

function MiniTrendChart() {
    return (
        <svg viewBox="0 0 780 210" className="hero-chart-svg" aria-hidden="true">
            <path d="M20 180 L100 150 L180 158 L260 126 L340 132 L420 74 L500 88 L580 56 L660 70 L740 34" className="trend-line" />
            <path d="M20 188 L100 172 L180 184 L260 166 L340 174 L420 124 L500 134 L580 112 L660 121 L740 96" className="trend-line-muted" />
        </svg>
    );
}

function BarPulse({ valueA, valueB, valueC }) {
    const max = Math.max(1, valueA, valueB, valueC);

    const bars = [valueA, valueB, valueC].map((value) => `${Math.max(14, Math.round((value / max) * 100))}%`);

    return (
        <div className="bar-pulse">
            <div style={{ height: bars[0] }} />
            <div style={{ height: bars[1] }} />
            <div style={{ height: bars[2] }} />
        </div>
    );
}

function SimpleSparkline() {
    return (
        <svg viewBox="0 0 240 92" className="sparkline" aria-hidden="true">
            <path d="M0 60 L30 64 L60 52 L90 67 L120 33 L150 42 L180 28 L210 36 L240 14" className="sparkline-main" />
            <path d="M0 72 L30 76 L60 65 L90 74 L120 58 L150 66 L180 56 L210 64 L240 51" className="sparkline-muted" />
        </svg>
    );
}

function Donut({ value, caption }) {
    return (
        <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(var(--accent) 0 ${value}%, var(--track) ${value}% 100%)` }}>
                <div className="donut-inner">{value}%</div>
            </div>
            <div className="donut-caption">{caption}</div>
        </div>
    );
}

function KanbanColumn({ id, title, items, canUpdate, onQuickStatus }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <article ref={setNodeRef} className="kanban-col">
            <div className="kanban-col-head">
                <h3>{title}</h3>
                <span>{items.length}</span>
            </div>
            <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
                <div className="kanban-col-body">
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
            <div className="ticket-top">
                <span className={clsx('ticket-priority', priorityClass[ticket.priority] || 'badge-p3')}>{ticket.priority}</span>
                <span className="ticket-code">{ticket.ticket_code}</span>
            </div>

            <h4>{ticket.title}</h4>
            <p>{ticket.description || 'No description provided'}</p>

            <div className="ticket-meta">
                <span>{ticket.node_name || '-'}</span>
                <span className={clsx('ticket-timer', overdue && 'ticket-timer-overdue')}>{formatTimer(deadline)}</span>
            </div>

            {canUpdate ? (
                <div className="ticket-actions">
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

createRoot(document.getElementById('app')).render(<App />);
