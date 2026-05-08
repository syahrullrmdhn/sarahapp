export function hasPermission(profile, permission) {
    return (profile?.permissions || []).includes(permission);
}

export function formatTimer(deadline) {
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

