import clsx from 'clsx';
import React from 'react';

export default function UserManagementPanel({ users, roles, newUser, setNewUser, createUser, toggleUserActive, setUserRole }) {
    return (
        <section className="cartel-card">
            <div className="cartel-card-head">
                <div>
                    <div className="cartel-card-title">User Management</div>
                    <div className="cartel-card-sub">Manage accounts, roles, and access.</div>
                </div>
            </div>

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

            <div className="cartel-table-wrap" style={{ marginTop: 14 }}>
                <table className="cartel-table">
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
                                <td className="cartel-table-strong">{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.is_active ? <span className="cartel-badge">Active</span> : <span className="cartel-badge badge-p1">Disabled</span>}</td>
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

