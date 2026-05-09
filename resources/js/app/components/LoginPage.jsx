import { useState } from 'react';
import { api } from '../api';

export default function LoginPage({ onLogin, isLoading, setIsLoading, error, setError }) {
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleLogin = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', {
                email: credentials.email,
                password: credentials.password,
            });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            onLogin(token, user);
        } catch (e) {
            setError(e?.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="auth-wrap">
            <div className="auth-panel">
                <div className="brand-row">
                    <div className="brand-icon">RS</div>
                    <h1 className="auth-title">Welcome back</h1>
                    <p className="auth-subtitle">Please enter your details to sign in.</p>
                </div>

                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-sub)' }}>Email</label>
                        <input
                            className="input"
                            type="email"
                            required
                            placeholder="name@example.com"
                            value={credentials.email}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-sub)' }}>Password</label>
                        <input
                            className="input"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={credentials.password}
                            onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                        />
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer text-sm" style={{ color: 'var(--text-sub)' }}>
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 dark:border-zinc-600 text-blue-600 focus:ring-blue-500"
                        />
                        Remember me
                    </label>

                    <button className="btn-primary w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Signing in...' : 'Sign in'}
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