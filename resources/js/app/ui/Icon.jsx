export default function Icon({ name }) {
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

