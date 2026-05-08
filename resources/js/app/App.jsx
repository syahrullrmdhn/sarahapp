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

    const navItemClass = (key) => clsx(
        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        key === menu
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
    );
    const navIconClass = (key) => clsx('h-5 w-5', key === menu ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200');

    const iconBtnClass = 'inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-300 dark:hover:bg-slate-800';

    return (
        <div className="min-h-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <button
                type="button"
                className={clsx('fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden', sidebarOpen ? 'block' : 'hidden')}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close navigation"
            />

            <div className="lg:grid lg:grid-cols-[280px,1fr]">
                <aside
                    className={clsx(
                        'fixed inset-y-0 left-0 z-40 w-72 -translate-x-full transform transition-transform duration-200 ease-out lg:static lg:translate-x-0 lg:w-[280px]',
                        sidebarOpen && 'translate-x-0',
                    )}
                >
                    <div className="flex h-full flex-col bg-slate-900 px-4 py-5 text-slate-400">
                        <div className="flex items-center gap-3 px-2 pb-4 border-b border-white/10">
                            <img
                                className="h-8 w-auto object-contain"
                                src="/Unique%20Command%20Center%20Logo%20for%20SARAH.png"
                                alt="SARAH"
                            />
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate">SARAH Command Center</div>
                                <div className="text-xs text-slate-400 truncate">Smart Automated Response Hub</div>
                            </div>
                        </div>

                        <nav className="mt-4 space-y-1">
                            <button type="button" className={clsx(navItemClass('dashboard'), 'group')} onClick={() => navigateMenu('dashboard')}>
                                <span className={navIconClass('dashboard')} aria-hidden="true"><Icon name="dashboard" /></span>
                                Dashboard
                            </button>
                            <button type="button" className={clsx(navItemClass('tickets'), 'group')} onClick={() => navigateMenu('tickets')}>
                                <span className={navIconClass('tickets')} aria-hidden="true"><Icon name="tickets" /></span>
                                Tickets
                            </button>
                            {canViewReports ? (
                                <button type="button" className={clsx(navItemClass('reports'), 'group')} onClick={() => navigateMenu('reports')}>
                                    <span className={navIconClass('reports')} aria-hidden="true"><Icon name="reports" /></span>
                                    Reports
                                </button>
                            ) : null}

                            <div className="pt-4">
                                <div className="px-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Ops</div>
                                <div className="mt-2 space-y-1">
                                    {canViewHelpdesk || canCreateHelpdesk ? (
                                        <button type="button" className={clsx(navItemClass('helpdesk'), 'group')} onClick={() => navigateMenu('helpdesk')}>
                                            <span className={navIconClass('helpdesk')} aria-hidden="true"><Icon name="helpdesk" /></span>
                                            Helpdesk
                                        </button>
                                    ) : null}
                                    {canCreateEos ? (
                                        <button type="button" className={clsx(navItemClass('eos'), 'group')} onClick={() => navigateMenu('eos')}>
                                            <span className={navIconClass('eos')} aria-hidden="true"><Icon name="eos" /></span>
                                            EOS Updates
                                        </button>
                                    ) : null}
                                    {canViewNotifications ? (
                                        <button type="button" className={clsx(navItemClass('notifications'), 'group')} onClick={() => navigateMenu('notifications')}>
                                            <span className={navIconClass('notifications')} aria-hidden="true"><Icon name="notifications" /></span>
                                            Notifications
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="px-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Admin</div>
                                <div className="mt-2 space-y-1">
                                    {canManageUsers ? (
                                        <button type="button" className={clsx(navItemClass('users'), 'group')} onClick={() => navigateMenu('users')}>
                                            <span className={navIconClass('users')} aria-hidden="true"><Icon name="users" /></span>
                                            Users
                                        </button>
                                    ) : null}
                                    {canViewAudit ? (
                                        <button type="button" className={clsx(navItemClass('audit'), 'group')} onClick={() => navigateMenu('audit')}>
                                            <span className={navIconClass('audit')} aria-hidden="true"><Icon name="audit" /></span>
                                            Audit
                                        </button>
                                    ) : null}
                                    <button type="button" className={clsx(navItemClass('integrations'), 'group')} onClick={() => navigateMenu('integrations')}>
                                        <span className={navIconClass('integrations')} aria-hidden="true"><Icon name="integrations" /></span>
                                        Integrations
                                    </button>
                                    {canManageNodes ? (
                                        <button type="button" className={clsx(navItemClass('nodes'), 'group')} onClick={() => navigateMenu('nodes')}>
                                            <span className={navIconClass('nodes')} aria-hidden="true"><Icon name="nodes" /></span>
                                            Nodes
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </nav>

                        <div className="mt-auto pt-4 border-t border-white/10">
                            <div className="flex items-center gap-3 px-2">
                                <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white font-semibold">
                                    {(profile?.name || 'U').slice(0, 1).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-white truncate">{profile?.name}</div>
                                    <div className="text-xs text-slate-400 truncate">{(profile?.roles || []).join(', ') || 'user'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="min-w-0">
                    <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-4 px-4 py-4 lg:px-6">
                            <div className="flex items-center gap-3 min-w-0">
                                <button
                                    className={clsx(iconBtnClass, 'lg:hidden')}
                                    type="button"
                                    onClick={() => setSidebarOpen(true)}
                                    aria-label="Open navigation"
                                >
                                    <span className="h-5 w-5" aria-hidden="true"><Icon name="menu" /></span>
                                </button>

                                <div className="min-w-0">
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},
                                    </div>
                                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                                        {profile?.name?.split(' ')[0] || 'Operator'}!
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label
                                    className="hidden md:flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600 border border-transparent focus-within:bg-white focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all dark:bg-slate-900 dark:text-slate-300 dark:focus-within:bg-slate-900 dark:focus-within:border-slate-700 dark:focus-within:ring-slate-800"
                                    style={{ width: 340 }}
                                >
                                    <span className="h-4 w-4 text-slate-400" aria-hidden="true"><Icon name="search" /></span>
                                    <input
                                        className="w-full bg-transparent outline-none placeholder:text-slate-400"
                                        placeholder="Search tickets, nodes, users"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                    />
                                </label>

                                <button className={iconBtnClass} type="button" onClick={refreshBase} aria-label="Refresh">
                                    <span className="h-5 w-5" aria-hidden="true"><Icon name="refresh" /></span>
                                </button>
                                <button
                                    className={iconBtnClass}
                                    type="button"
                                    onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
                                    aria-label="Toggle theme"
                                >
                                    <span className="h-5 w-5" aria-hidden="true"><Icon name={theme === 'light' ? 'moon' : 'sun'} /></span>
                                </button>
                                <button className={iconBtnClass} type="button" onClick={logout} aria-label="Logout">
                                    <span className="h-5 w-5" aria-hidden="true"><Icon name="logout" /></span>
                                </button>
                            </div>
                        </div>
                    </header>

                    <main className="px-4 py-6 lg:px-6">
                        {error ? (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-950/30 dark:text-red-200">
                                {error}
                            </div>
                        ) : null}

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
        </div>
    );
}
