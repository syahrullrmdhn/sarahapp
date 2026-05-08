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
    { key: 'helpdesk', label: 'Helpdesk Reports' },
    { key: 'eos', label: 'EOS Action Updates', permission: 'eos.update.create' },
    { key: 'integrations', label: 'Monitoring Integrations' },
    { key: 'reports', label: 'Ops Consolidated Reports', permission: 'reports.view' },
    { key: 'notifications', label: 'Notification Logs', permission: 'notifications.view' },
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

function Icon({ name }) {
    const common = {
        viewBox: '0 0 24 24',
        fill: 'none',
        xmlns: 'http://www.w3.org/2000/svg',
    };

    switch (name) {
        case 'menu':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 7h16" />
                    <path d="M4 12h16" />
                    <path d="M4 17h16" />
                </svg>
            );
        case 'search':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                    <path d="M16.5 16.5 21 21" />
                </svg>
            );
        case 'dashboard':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h7v7H4V4Z" />
                    <path d="M13 4h7v4h-7V4Z" />
                    <path d="M13 10h7v10h-7V10Z" />
                    <path d="M4 13h7v7H4v-7Z" />
                </svg>
            );
        case 'tickets':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 7h14v10H7" />
                    <path d="M3 7h2v2H3V7Z" />
                    <path d="M3 11h2v2H3v-2Z" />
                    <path d="M3 15h2v2H3v-2Z" />
                </svg>
            );
        case 'reports':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V5" />
                    <path d="M8 19v-7" />
                    <path d="M12 19v-4" />
                    <path d="M16 19v-10" />
                    <path d="M20 19v-6" />
                </svg>
            );
        case 'helpdesk':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16v10H7l-3 3V6Z" />
                    <path d="M8 10h8" />
                    <path d="M8 13h6" />
                </svg>
            );
        case 'eos':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5.3 5.3a2 2 0 0 0 2.8 2.8l5.3-5.3a4 4 0 0 0 5.4-5.4l-2 2-3-3 2-2Z" />
                </svg>
            );
        case 'notifications':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z" />
                    <path d="M9.7 19a2.3 2.3 0 0 0 4.6 0" />
                </svg>
            );
        case 'users':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                    <path d="M22 21v-2a3 3 0 0 0-2-2.8" />
                    <path d="M16 3.2a4 4 0 0 1 0 7.6" />
                </svg>
            );
        case 'audit':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-8-6Z" />
                    <path d="M14 2v6h6" />
                    <path d="M8 13h8" />
                    <path d="M8 17h5" />
                </svg>
            );
        case 'integrations':
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 7h8" />
                    <path d="M12 3v8" />
                    <path d="M7 12h10v8H7v-8Z" />
                </svg>
            );
        default:
            return (
                <svg {...common} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                </svg>
            );
    }
}

function App() {
    const [token, setToken] = useState(() => localStorage.getItem('sarah_token') || '');
    const [theme, setTheme] = useState(() => localStorage.getItem('sarah_theme') || 'light');
    const [menu, setMenu] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
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
    const [helpdeskReports, setHelpdeskReports] = useState([]);
    const [eosTicketUpdates, setEosTicketUpdates] = useState([]);
    const [opsReport, setOpsReport] = useState(null);
    const [notificationLogs, setNotificationLogs] = useState([]);
    const [selectedEosTicket, setSelectedEosTicket] = useState(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        timezone: 'Asia/Jakarta',
        is_active: true,
        roles: [],
    });
    const [newHelpdeskReport, setNewHelpdeskReport] = useState({
        reporter_name: '',
        reporter_contact: '',
        channel: 'web',
        title: '',
        description: '',
        location: '',
        impact_level: '',
        node_name: '',
        severity_input: '',
    });
    const [newEosUpdate, setNewEosUpdate] = useState({
        action_type: 'update',
        message: '',
        attachment_url: '',
        status: '',
    });
    const [searchQuery, setSearchQuery] = useState('');

    const sensors = useSensors(useSensor(PointerSensor));

    const navigateMenu = (nextMenu) => {
        setMenu(nextMenu);
        setSidebarOpen(false);
    };

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

            if (nextMenu === 'helpdesk' && hasPermission(userProfile, 'helpdesk.report.view')) {
                const helpdeskRes = await api.get('/helpdesk/reports');
                setHelpdeskReports(helpdeskRes.data.data || []);
            }

            if (nextMenu === 'reports' && hasPermission(userProfile, 'reports.view')) {
                const opsRes = await api.get('/reports/operations');
                setOpsReport(opsRes.data);
            }

            if (nextMenu === 'notifications' && hasPermission(userProfile, 'notifications.view')) {
                const notifRes = await api.get('/notifications');
                setNotificationLogs(notifRes.data.data || []);
            }

            if (nextMenu === 'eos' && hasPermission(userProfile, 'eos.update.create')) {
                const availableTickets = Object.values(board.columns || {}).flat();
                const pickedTicket = selectedEosTicket || availableTickets[0] || null;
                setSelectedEosTicket(pickedTicket);

                if (pickedTicket) {
                    const eosRes = await api.get(`/tickets/${pickedTicket.id}/eos-updates`);
                    setEosTicketUpdates(eosRes.data.data || []);
                } else {
                    setEosTicketUpdates([]);
                }
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
        setHelpdeskReports([]);
        setEosTicketUpdates([]);
        setOpsReport(null);
        setNotificationLogs([]);
        setSelectedEosTicket(null);
    };

    const canUpdateTicket = useMemo(() => hasPermission(profile, 'tickets.update'), [profile]);
    const canManageUsers = useMemo(() => hasPermission(profile, 'users.manage'), [profile]);
    const canViewAudit = useMemo(() => hasPermission(profile, 'audit.view'), [profile]);
    const canViewHelpdesk = useMemo(() => hasPermission(profile, 'helpdesk.report.view'), [profile]);
    const canCreateHelpdesk = useMemo(() => hasPermission(profile, 'helpdesk.report.create'), [profile]);
    const canCreateEos = useMemo(() => hasPermission(profile, 'eos.update.create'), [profile]);
    const canViewReports = useMemo(() => hasPermission(profile, 'reports.view'), [profile]);
    const canViewNotifications = useMemo(() => hasPermission(profile, 'notifications.view'), [profile]);

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

    const createHelpdeskReport = async (event) => {
        event.preventDefault();

        try {
            await api.post('/helpdesk/reports', newHelpdeskReport);
            setNewHelpdeskReport({
                reporter_name: '',
                reporter_contact: '',
                channel: 'web',
                title: '',
                description: '',
                location: '',
                impact_level: '',
                node_name: '',
                severity_input: '',
            });
            await refreshBase();
            await refreshContextual('helpdesk');
            setMenu('tickets');
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to submit helpdesk report');
        }
    };

    const onSelectEosTicket = async (ticketId) => {
        if (!ticketId) {
            setSelectedEosTicket(null);
            setEosTicketUpdates([]);
            return;
        }

        const ticket = Object.values(board.columns || {})
            .flat()
            .find((item) => item.id === Number(ticketId));

        setSelectedEosTicket(ticket || null);

        try {
            const eosRes = await api.get(`/tickets/${ticketId}/eos-updates`);
            setEosTicketUpdates(eosRes.data.data || []);
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to fetch EOS updates');
        }
    };

    const createEosUpdate = async (event) => {
        event.preventDefault();

        if (!selectedEosTicket) {
            setError('Please select a ticket first');
            return;
        }

        try {
            const payload = {
                action_type: newEosUpdate.action_type,
                message: newEosUpdate.message,
                attachment_url: newEosUpdate.attachment_url || undefined,
                status: newEosUpdate.status || undefined,
            };
            await api.post(`/tickets/${selectedEosTicket.id}/eos-updates`, payload);
            setNewEosUpdate({
                action_type: 'update',
                message: '',
                attachment_url: '',
                status: '',
            });
            await onSelectEosTicket(selectedEosTicket.id);
            await refreshBase();
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to submit EOS update');
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
                            <h1 className="auth-title">SARAH Command Center</h1>
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

                    {import.meta.env?.DEV ? (
                        <div className="dev-cred-box">
                            <div className="dev-cred-title">Super Admin (Dev)</div>
                            <div>superadmin@sarah.local</div>
                            <div>S4rahSecure!2026</div>
                        </div>
                    ) : null}

                    {error ? <p className="auth-error">{error}</p> : null}
                </div>
            </main>
        );
    }

    return (
        <div className="cartel-shell">
            <div className={clsx('cartel-overlay', sidebarOpen && 'is-open')} onClick={() => setSidebarOpen(false)} />

            <aside className={clsx('cartel-sidebar', sidebarOpen && 'is-open')}>
                <div className="cartel-brand">
                    <img
                        className="cartel-brand-logo"
                        src="/Unique%20Command%20Center%20Logo%20for%20SARAH.png"
                        alt="SARAH"
                    />
                    <div className="cartel-brand-text">
                        <div className="cartel-brand-name">SARAH Command Center</div>
                        <div className="cartel-brand-sub">Smart Automated Response Hub</div>
                    </div>
                </div>

                <nav className="cartel-nav">
                    <button
                        type="button"
                        className={clsx('cartel-nav-item', menu === 'dashboard' && 'cartel-nav-item-active')}
                        onClick={() => navigateMenu('dashboard')}
                    >
                        <span className="cartel-nav-icon" aria-hidden="true">
                            <Icon name="dashboard" />
                        </span>
                        Dashboard
                    </button>
                    <button
                        type="button"
                        className={clsx('cartel-nav-item', menu === 'tickets' && 'cartel-nav-item-active')}
                        onClick={() => navigateMenu('tickets')}
                    >
                        <span className="cartel-nav-icon" aria-hidden="true">
                            <Icon name="tickets" />
                        </span>
                        Tickets
                    </button>
                    {canViewReports ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'reports' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('reports')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="reports" />
                            </span>
                            Reports
                        </button>
                    ) : null}

                    <div className="cartel-nav-section">Ops</div>
                    {canViewHelpdesk || canCreateHelpdesk ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'helpdesk' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('helpdesk')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="helpdesk" />
                            </span>
                            Helpdesk
                        </button>
                    ) : null}
                    {canCreateEos ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'eos' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('eos')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="eos" />
                            </span>
                            EOS Updates
                        </button>
                    ) : null}
                    {canViewNotifications ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'notifications' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('notifications')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="notifications" />
                            </span>
                            Notifications
                        </button>
                    ) : null}

                    <div className="cartel-nav-section">Admin</div>
                    {canManageUsers ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'users' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('users')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="users" />
                            </span>
                            Users
                        </button>
                    ) : null}
                    {canViewAudit ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'audit' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('audit')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="audit" />
                            </span>
                            Audit
                        </button>
                    ) : null}
                    <button
                        type="button"
                        className={clsx('cartel-nav-item', menu === 'integrations' && 'cartel-nav-item-active')}
                        onClick={() => navigateMenu('integrations')}
                    >
                        <span className="cartel-nav-icon" aria-hidden="true">
                            <Icon name="integrations" />
                        </span>
                        Integrations
                    </button>
                </nav>

                <div className="cartel-user">
                    <div className="cartel-user-avatar">{(profile?.name || 'U').slice(0, 1).toUpperCase()}</div>
                    <div>
                        <div className="cartel-user-name">{profile?.name}</div>
                        <div className="cartel-user-sub">{(profile?.roles || []).join(', ') || 'user'}</div>
                    </div>
                </div>
            </aside>

            <section className="cartel-main">
                <header className="cartel-top">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            className="cartel-mobile-toggle"
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open navigation"
                        >
                            <Icon name="menu" />
                        </button>

                        <div className="cartel-greeting min-w-0">
                            <div className="cartel-greeting-kicker">
                                Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},
                            </div>
                            <div className="cartel-greeting-name">
                                {profile?.name?.split(' ')[0] || 'Operator'}!
                            </div>
                        </div>
                    </div>
                    <div className="cartel-top-actions">
                        <label className="cartel-search">
                            <span className="cartel-search-icon" aria-hidden="true">
                                <Icon name="search" />
                            </span>
                            <input
                                className="cartel-search-input"
                                placeholder="Search tickets, nodes, users"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                        </label>
                        <button className="cartel-btn" type="button" onClick={refreshBase}>
                            Refresh
                        </button>
                        <button
                            className="cartel-btn"
                            type="button"
                            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                        >
                            {theme === 'light' ? 'Dark' : 'Light'}
                        </button>
                        <button className="cartel-btn cartel-btn-strong" type="button" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </header>

                <main className="cartel-content">
                {error ? <div className="error-banner">{error}</div> : null}

                {menu === 'dashboard' ? (
                    <DashboardView
                        board={board}
                        boardCounts={boardCounts}
                        stats={stats}
                        responseCompliance={responseCompliance}
                        setMenu={navigateMenu}
                    />
                ) : null}

                {menu === 'tickets' ? (
                    <TicketBoardView
                        board={board}
                        searchQuery={searchQuery}
                        canUpdateTicket={canUpdateTicket}
                        onDragEnd={onDragEnd}
                        sensors={sensors}
                        updateStatus={updateStatus}
                    />
                ) : null}

                {menu === 'integrations' ? <IntegrationPanel integrations={integrations} /> : null}

                {menu === 'helpdesk' && (canViewHelpdesk || canCreateHelpdesk) ? (
                    <HelpdeskPanel
                        canCreateHelpdesk={canCreateHelpdesk}
                        helpdeskReports={helpdeskReports}
                        newHelpdeskReport={newHelpdeskReport}
                        setNewHelpdeskReport={setNewHelpdeskReport}
                        createHelpdeskReport={createHelpdeskReport}
                    />
                ) : null}

                {menu === 'eos' && canCreateEos ? (
                    <EosPanel
                        board={board}
                        selectedEosTicket={selectedEosTicket}
                        onSelectEosTicket={onSelectEosTicket}
                        newEosUpdate={newEosUpdate}
                        setNewEosUpdate={setNewEosUpdate}
                        createEosUpdate={createEosUpdate}
                        eosTicketUpdates={eosTicketUpdates}
                    />
                ) : null}

                {menu === 'reports' && canViewReports ? <OperationsReportPanel opsReport={opsReport} /> : null}

                {menu === 'notifications' && canViewNotifications ? <NotificationPanel logs={notificationLogs} /> : null}

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

function StatCard({ title, value, deltaLabel, deltaTone = 'ok', icon = 'dashboard', chartTone = 'accent' }) {
    return (
        <section className="cartel-card cartel-stat-card">
            <div className="cartel-stat-head">
                <div>
                    <div className="cartel-stat-title">{title}</div>
                    <div className="cartel-stat-value">{value}</div>
                    <div className={clsx('cartel-stat-delta', deltaTone === 'bad' && 'is-bad')}>{deltaLabel}</div>
                </div>
                <div className="cartel-stat-icon" aria-hidden="true">
                    <Icon name={icon} />
                </div>
            </div>
            <div className="cartel-stat-chart" aria-hidden="true">
                <MiniAreaSpark tone={chartTone} />
            </div>
        </section>
    );
}

function MiniAreaSpark({ tone = 'accent' }) {
    const colors = {
        accent: { stroke: 'var(--accent)', fill: 'color-mix(in srgb, var(--accent) 26%, transparent)' },
        warning: { stroke: 'var(--warning)', fill: 'color-mix(in srgb, var(--warning) 22%, transparent)' },
        success: { stroke: 'var(--success)', fill: 'color-mix(in srgb, var(--success) 22%, transparent)' },
    };
    const c = colors[tone] || colors.accent;

    // Static sparkline for now; later we can feed it real telemetry.
    const d = 'M0 42 C 18 28, 36 56, 54 40 C 72 26, 90 28, 108 38 C 126 48, 144 20, 162 28 C 180 36, 198 46, 216 34 C 234 22, 252 30, 270 26';
    const area = `${d} L 270 60 L 0 60 Z`;

    return (
        <svg viewBox="0 0 270 60" preserveAspectRatio="none" className="cartel-spark">
            <path d={area} fill={c.fill} />
            <path d={d} fill="none" stroke={c.stroke} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    );
}

function DashboardView({ board, boardCounts, stats, responseCompliance, setMenu }) {
    const completionRate = boardCounts.total > 0 ? Math.round((boardCounts.closed / boardCounts.total) * 100) : 0;
    const tickets = useMemo(() => Object.values(board.columns || {}).flat(), [board]);
    const latestTickets = useMemo(() => {
        const sorted = [...tickets].sort((a, b) => {
            const ta = new Date(a.created_at || 0).getTime();
            const tb = new Date(b.created_at || 0).getTime();
            return tb - ta;
        });
        return sorted.slice(0, 8);
    }, [tickets]);

    const openTickets = stats?.open_tickets ?? 0;
    const escalatedTickets = boardCounts.escalated ?? 0;
    const escalatedPct = openTickets > 0 ? Math.round((escalatedTickets / openTickets) * 100) : 0;
    const closedToday = stats?.closed_today ?? 0;
    const responseBreached = stats?.sla_response_breached ?? 0;

    return (
        <div className="cartel-dashboard">
            <div className="cartel-stat-grid">
                <StatCard
                    title="Open tickets"
                    value={openTickets}
                    deltaLabel={openTickets > 0 ? `${escalatedPct}% escalated` : 'No active incidents'}
                    deltaTone={escalatedPct >= 15 ? 'bad' : 'ok'}
                    icon="tickets"
                    chartTone="accent"
                />
                <StatCard
                    title="Response breach"
                    value={responseBreached}
                    deltaLabel={`${responseCompliance}% compliance`}
                    deltaTone={responseBreached > 0 ? 'bad' : 'ok'}
                    icon="audit"
                    chartTone="warning"
                />
                <StatCard
                    title="Closed today"
                    value={closedToday}
                    deltaLabel={`${completionRate}% completion rate`}
                    deltaTone="ok"
                    icon="dashboard"
                    chartTone="success"
                />
            </div>

            <div className="cartel-split-grid">
                <section className="cartel-card">
                    <div className="cartel-card-head">
                        <div>
                            <div className="cartel-card-title">Total incidents</div>
                            <div className="cartel-card-sub">Trend across the last 12 hours (sample)</div>
                        </div>
                        <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                            View all
                            <span aria-hidden="true">↗</span>
                        </button>
                    </div>
                    <div className="cartel-card-body">
                        <MiniTrendChart />
                    </div>
                </section>

                <section className="cartel-card">
                    <div className="cartel-card-head">
                        <div>
                            <div className="cartel-card-title">SLA overview</div>
                            <div className="cartel-card-sub">Response vs resolution targets</div>
                        </div>
                        <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                            Open board
                            <span aria-hidden="true">↗</span>
                        </button>
                    </div>
                    <div className="cartel-card-body cartel-sla-grid">
                        <div className="cartel-mini-card">
                            <div className="cartel-mini-kicker">Response</div>
                            <div className="cartel-mini-value">{responseCompliance}%</div>
                            <div className="cartel-mini-sub">Compliance rate</div>
                            <SimpleSparkline />
                        </div>
                        <div className="cartel-mini-card">
                            <div className="cartel-mini-kicker">Completion</div>
                            <div className="cartel-mini-value">{completionRate}%</div>
                            <div className="cartel-mini-sub">Closed vs total</div>
                            <Donut value={completionRate} caption="Closed" />
                        </div>
                    </div>
                </section>
            </div>

            <section className="cartel-card cartel-table-card">
                <div className="cartel-card-head">
                    <div>
                        <div className="cartel-card-title">Latest tickets</div>
                        <div className="cartel-card-sub">Most recent incidents from monitoring + helpdesk</div>
                    </div>
                    <button className="cartel-link-btn" type="button" onClick={() => setMenu('tickets')}>
                        View all
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>

                <div className="cartel-table-wrap">
                    <table className="cartel-table">
                        <thead>
                            <tr>
                                <th>Ticket</th>
                                <th>Created</th>
                                <th>Node</th>
                                <th>Status</th>
                                <th>Priority</th>
                                <th>Assignee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {latestTickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="cartel-table-strong">{ticket.ticket_code}</td>
                                    <td>{ticket.created_at ? new Date(ticket.created_at).toLocaleString() : '-'}</td>
                                    <td>{ticket.node_name || '-'}</td>
                                    <td>
                                        <span className="cartel-badge">{statusLabels[ticket.status] || ticket.status}</span>
                                    </td>
                                    <td>
                                        <span className={clsx('cartel-badge', priorityClass[ticket.priority] || priorityClass.P3)}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td>{ticket.assignee?.name || '-'}</td>
                                </tr>
                            ))}
                            {latestTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="cartel-empty">
                                        No tickets yet. Ingest a webhook or submit a helpdesk report.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

function TicketBoardView({ board, searchQuery, canUpdateTicket, onDragEnd, sensors, updateStatus }) {
    const q = (searchQuery || '').trim().toLowerCase();
    const filterItems = (items) => {
        if (!q) {
            return items;
        }
        return items.filter((ticket) => {
            const hay = `${ticket.ticket_code} ${ticket.title} ${ticket.node_name || ''}`.toLowerCase();
            return hay.includes(q);
        });
    };

    return (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
            <section className="ticket-board">
                {columnsOrder.map((status) => (
                    <KanbanColumn
                        key={status}
                        id={status}
                        title={statusLabels[status]}
                        items={filterItems(board.columns?.[status] || [])}
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

function HelpdeskPanel({ canCreateHelpdesk, helpdeskReports, newHelpdeskReport, setNewHelpdeskReport, createHelpdeskReport }) {
    return (
        <section className="panel-elevated detail-panel">
            <h2>Helpdesk Reports</h2>
            <p>Intake laporan dari Paragonians (web, WhatsApp, email) dan auto-konversi menjadi tiket incident.</p>

            {canCreateHelpdesk ? (
                <form className="user-form mt-4" onSubmit={createHelpdeskReport}>
                    <input
                        className="input"
                        placeholder="Reporter name"
                        required
                        value={newHelpdeskReport.reporter_name}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_name: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Reporter contact"
                        value={newHelpdeskReport.reporter_contact}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, reporter_contact: event.target.value }))}
                    />
                    <select
                        className="input"
                        value={newHelpdeskReport.channel}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, channel: event.target.value }))}
                    >
                        <option value="web">Web</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="email">Email</option>
                    </select>
                    <input
                        className="input md:col-span-2"
                        placeholder="Issue title"
                        required
                        value={newHelpdeskReport.title}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, title: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Location"
                        value={newHelpdeskReport.location}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, location: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Node name"
                        value={newHelpdeskReport.node_name}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, node_name: event.target.value }))}
                    />
                    <input
                        className="input"
                        placeholder="Impact (critical/high/medium/low)"
                        value={newHelpdeskReport.impact_level}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, impact_level: event.target.value }))}
                    />
                    <textarea
                        className="input md:col-span-3"
                        placeholder="Incident description"
                        rows={4}
                        required
                        value={newHelpdeskReport.description}
                        onChange={(event) => setNewHelpdeskReport((prev) => ({ ...prev, description: event.target.value }))}
                    />
                    <button className="btn-primary" type="submit">Submit To Helpdesk</button>
                </form>
            ) : null}

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Reporter</th>
                            <th>Channel</th>
                            <th>Title</th>
                            <th>Ticket</th>
                        </tr>
                    </thead>
                    <tbody>
                        {helpdeskReports.map((report) => (
                            <tr key={report.id}>
                                <td>{new Date(report.reported_at).toLocaleString()}</td>
                                <td>{report.reporter_name}</td>
                                <td>{report.channel}</td>
                                <td>{report.title}</td>
                                <td>{report.ticket?.ticket_code || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function EosPanel({ board, selectedEosTicket, onSelectEosTicket, newEosUpdate, setNewEosUpdate, createEosUpdate, eosTicketUpdates }) {
    const tickets = Object.values(board.columns || {}).flat();

    return (
        <section className="panel-elevated detail-panel">
            <h2>EOS Action Updates</h2>
            <p>Update aksi lapangan EOS (onsite, fix applied, verification) dan sinkron status tiket.</p>

            <form className="user-form mt-4" onSubmit={createEosUpdate}>
                <select className="input" value={selectedEosTicket?.id || ''} onChange={(event) => onSelectEosTicket(event.target.value)}>
                    <option value="">Select ticket</option>
                    {tickets.map((ticket) => (
                        <option key={ticket.id} value={ticket.id}>
                            {ticket.ticket_code} - {ticket.title}
                        </option>
                    ))}
                </select>
                <select
                    className="input"
                    value={newEosUpdate.action_type}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, action_type: event.target.value }))}
                >
                    <option value="update">Update</option>
                    <option value="onsite">Onsite</option>
                    <option value="fix_applied">Fix applied</option>
                    <option value="verification">Verification</option>
                </select>
                <select
                    className="input"
                    value={newEosUpdate.status}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, status: event.target.value }))}
                >
                    <option value="">No status change</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="in_progress">In progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
                <input
                    className="input md:col-span-2"
                    placeholder="Attachment URL (optional)"
                    value={newEosUpdate.attachment_url}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, attachment_url: event.target.value }))}
                />
                <textarea
                    className="input md:col-span-3"
                    rows={4}
                    required
                    placeholder="Field action update detail"
                    value={newEosUpdate.message}
                    onChange={(event) => setNewEosUpdate((prev) => ({ ...prev, message: event.target.value }))}
                />
                <button className="btn-primary" type="submit">Post EOS Update</button>
            </form>

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>EOS</th>
                            <th>Action</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eosTicketUpdates.map((update) => (
                            <tr key={update.id}>
                                <td>{new Date(update.created_at).toLocaleString()}</td>
                                <td>{update.eos_user?.name || 'system'}</td>
                                <td>{update.action_type}</td>
                                <td>{update.message}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function OperationsReportPanel({ opsReport }) {
    return (
        <section className="panel-elevated detail-panel">
            <h2>Consolidated Operations Report</h2>
            <p>Ringkasan 7 hari terakhir untuk monitoring, helpdesk, ticketing, dan aksi EOS.</p>

            <div className="ops-grid">
                <article className="mini-stat">
                    <h3>By Priority</h3>
                    <pre>{JSON.stringify(opsReport?.tickets_by_priority || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>By Status</h3>
                    <pre>{JSON.stringify(opsReport?.tickets_by_status || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>Helpdesk Channels</h3>
                    <pre>{JSON.stringify(opsReport?.helpdesk_channels || {}, null, 2)}</pre>
                </article>
                <article className="mini-stat">
                    <h3>EOS Actions</h3>
                    <pre>{JSON.stringify(opsReport?.eos_actions || {}, null, 2)}</pre>
                </article>
            </div>
        </section>
    );
}

function NotificationPanel({ logs }) {
    return (
        <section className="panel-elevated detail-panel">
            <h2>Notification Logs</h2>
            <p>Log notifikasi eskalasi dan assignment (telegram/in-app/email placeholder).</p>

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Channel</th>
                            <th>Event</th>
                            <th>Target</th>
                            <th>Ticket</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>{new Date(log.created_at).toLocaleString()}</td>
                                <td>{log.channel}</td>
                                <td>{log.event}</td>
                                <td>{log.target || '-'}</td>
                                <td>{log.ticket?.ticket_code || '-'}</td>
                                <td>{log.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
