import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { columnsOrder } from './constants';
import { hasPermission } from './utils';
import { api, clearAuthToken, setAuthToken } from './api';

import Icon from './ui/Icon';
import DashboardView from './views/DashboardView';
import TicketBoardView from './views/TicketBoardView';
import IntegrationPanel from './views/IntegrationPanel';
import HelpdeskPanel from './views/HelpdeskPanel';
import EosPanel from './views/EosPanel';
import OperationsReportPanel from './views/OperationsReportPanel';
import NotificationPanel from './views/NotificationPanel';
import UserManagementPanel from './views/UserManagementPanel';
import AuditPanel from './views/AuditPanel';
import NodesPanel from './views/NodesPanel';

export default function App() {
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
    const [auditLogs, setAuditLogs] = useState([]);
    const [helpdeskReports, setHelpdeskReports] = useState([]);
    const [eosTicketUpdates, setEosTicketUpdates] = useState([]);
    const [opsReport, setOpsReport] = useState(null);
    const [notificationLogs, setNotificationLogs] = useState([]);
    const [selectedEosTicket, setSelectedEosTicket] = useState(null);

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

        setAuthToken(token);
        localStorage.setItem('sarah_token', token);

        const boot = async () => {
            await refreshBase();
        };

        boot();

        const intervalId = window.setInterval(() => {
            refreshBase();
        }, 15000);

        return () => window.clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!token || !profile) {
            return;
        }

        refreshContextual(menu);
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        clearAuthToken();
        setToken('');
        setMenu('dashboard');
        setProfile(null);
        setBoard({ columns: {}, meta: {} });
        setStats(null);
        setIntegrations({ webhook_sources: [], telegram: null });
        setAuditLogs([]);
        setHelpdeskReports([]);
        setEosTicketUpdates([]);
        setOpsReport(null);
        setNotificationLogs([]);
        setSelectedEosTicket(null);
    };

    const canUpdateTicket = useMemo(() => hasPermission(profile, 'tickets.update'), [profile]);
    const canCreateTicket = useMemo(() => hasPermission(profile, 'tickets.create'), [profile]);
    const canManageUsers = useMemo(() => hasPermission(profile, 'users.manage'), [profile]);
    const canViewAudit = useMemo(() => hasPermission(profile, 'audit.view'), [profile]);
    const canViewHelpdesk = useMemo(() => hasPermission(profile, 'helpdesk.report.view'), [profile]);
    const canCreateHelpdesk = useMemo(() => hasPermission(profile, 'helpdesk.report.create'), [profile]);
    const canCreateEos = useMemo(() => hasPermission(profile, 'eos.update.create'), [profile]);
    const canViewReports = useMemo(() => hasPermission(profile, 'reports.view'), [profile]);
    const canViewNotifications = useMemo(() => hasPermission(profile, 'notifications.view'), [profile]);
    const canManageNodes = useMemo(() => hasPermission(profile, 'nodes.manage'), [profile]);
    const canManageIntegrations = useMemo(() => hasPermission(profile, 'integrations.manage'), [profile]);

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

    const createTicket = async (payload) => {
        try {
            await api.post('/tickets', payload);
            await refreshBase();
            return true;
        } catch (e) {
            setError(e?.response?.data?.message || 'Failed to create ticket');
            return false;
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

                    {canManageNodes ? (
                        <button
                            type="button"
                            className={clsx('cartel-nav-item', menu === 'nodes' && 'cartel-nav-item-active')}
                            onClick={() => navigateMenu('nodes')}
                        >
                            <span className="cartel-nav-icon" aria-hidden="true">
                                <Icon name="nodes" />
                            </span>
                            Nodes
                        </button>
                    ) : null}
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
                            canCreateTicket={canCreateTicket}
                            canUpdateTicket={canUpdateTicket}
                            onDragEnd={onDragEnd}
                            sensors={sensors}
                            updateStatus={updateStatus}
                            createTicket={createTicket}
                        />
                    ) : null}

                    {menu === 'integrations' ? (
                        <IntegrationPanel
                            integrations={integrations}
                            canManageIntegrations={canManageIntegrations}
                            onRefresh={() => refreshBase()}
                            setError={setError}
                        />
                    ) : null}

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
                            setError={setError}
                        />
                    ) : null}

                    {menu === 'audit' && canViewAudit ? <AuditPanel logs={auditLogs} /> : null}

                    {menu === 'nodes' && canManageNodes ? (
                        <NodesPanel
                            setError={setError}
                        />
                    ) : null}
                </main>
            </section>
        </div>
    );
}
