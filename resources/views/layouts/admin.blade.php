<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="robots" content="noindex, nofollow">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">

        <title>@yield('title', config('app.name', 'SARAH')) - Admin Console</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        @vite(['resources/css/app.css', 'resources/js/app.js'])

        {{-- Inline theme script to prevent flash --}}
        <script>
            if (localStorage.sarah_theme === 'dark' || (!('sarah_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
                document.documentElement.dataset.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.dataset.theme = 'light';
            }
            function toggleAdminTheme() {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.dataset.theme = 'light';
                    localStorage.sarah_theme = 'light';
                } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.theme = 'dark';
                    localStorage.sarah_theme = 'dark';
                }
            }
        </script>
    </head>

    {{--
        COLOR STRATEGY:
        Light: sky/slate gradients + glassy panels
        Dark:  deep navy + cyan accents (avoid flat pure black)
    --}}
    <body class="admin-shell font-sans antialiased text-gray-900 dark:text-gray-100 flex h-screen overflow-hidden transition-colors duration-300"
          x-data="{ mobileSidebarOpen: false }">

        {{-- ===== SIDEBAR (Desktop) ===== --}}
        <aside class="admin-sidebar w-64 h-full border-r border-sky-100 dark:border-cyan-900/40 flex-shrink-0 flex-col hidden md:flex transition-colors duration-300">
            {{-- Logo --}}
            <div class="h-16 flex items-center px-6 mt-4">
                <a href="{{ route('home') }}" class="flex items-center gap-3 w-full">
                    <div class="w-8 h-8 rounded-lg shrink-0 overflow-hidden bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
                        S
                    </div>
                    <span class="text-base font-semibold tracking-tight text-gray-900 dark:text-white truncate">
                        {{ config('app.name', 'SARAH') }}
                    </span>
                </a>
            </div>

            {{-- Nav --}}
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div class="px-2 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overview</div>

                <a href="{{ route('admin.dashboard') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.dashboard')
                             ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.dashboard') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="{{ request()->routeIs('admin.dashboard') ? 'currentColor' : 'none' }}" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dashboard
                </a>

                <div x-data="{ open: {{ request()->routeIs('admin.tickets.*') ? 'true' : 'false' }} }" class="space-y-1">
                    <button @click="open = !open"
                       class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                              {{ request()->routeIs('admin.tickets.*')
                                 ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
                                 : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-200' }}">
                        <div class="flex items-center">
                            <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.tickets.*') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}"
                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Tickets
                        </div>
                        <svg class="w-4 h-4 transition-transform duration-200" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div x-show="open" style="display: none;" class="space-y-1 pb-1">
                        <a href="{{ route('admin.tickets.index') }}"
                           class="flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.tickets.index') ? 'text-cyan-700 dark:text-cyan-200 bg-cyan-50/60 dark:bg-cyan-500/15' : 'text-slate-500 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-500/10' }}">
                            Board
                        </a>
                        <a href="{{ route('admin.tickets.create') }}"
                           class="flex items-center pl-11 pr-3 py-2 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.tickets.create') ? 'text-cyan-700 dark:text-cyan-200 bg-cyan-50/60 dark:bg-cyan-500/15' : 'text-slate-500 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-500/10' }}">
                            New Ticket
                        </a>
                    </div>
                </div>

                <div class="px-2 mt-6 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Operations</div>

                <a href="{{ route('admin.helpdesk.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.helpdesk.*')
                             ? 'bg-amber-50/90 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50/80 dark:hover:bg-amber-500/10 hover:text-amber-700 dark:hover:text-amber-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.helpdesk.*') ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Helpdesk
                </a>

                <a href="{{ route('admin.eos.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.eos.*')
                             ? 'bg-emerald-50/90 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.eos.*') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    EOS Updates
                </a>

                <a href="{{ route('admin.reports.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.reports.*')
                             ? 'bg-fuchsia-50/90 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-500/10 hover:text-fuchsia-700 dark:hover:text-fuchsia-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.reports.*') ? 'text-fuchsia-600 dark:text-fuchsia-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Reports
                </a>

                <a href="{{ route('admin.notifications.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.notifications.*')
                             ? 'bg-violet-50/90 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-violet-50/80 dark:hover:bg-violet-500/10 hover:text-violet-700 dark:hover:text-violet-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.notifications.*') ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                </a>

                <div class="px-2 mt-6 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Admin</div>

                <a href="{{ route('admin.users.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.users.*')
                             ? 'bg-teal-50/90 dark:bg-teal-500/20 text-teal-700 dark:text-teal-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50/80 dark:hover:bg-teal-500/10 hover:text-teal-700 dark:hover:text-teal-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.users.*') ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5V9H2v11h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Users
                </a>

                <a href="{{ route('admin.audit.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.audit.*')
                             ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.audit.*') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Audit Logs
                </a>

                <a href="{{ route('admin.integrations.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.integrations.*')
                             ? 'bg-indigo-50/90 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10 hover:text-indigo-700 dark:hover:text-indigo-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.integrations.*') ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    Integrations
                </a>

                <a href="{{ route('admin.nodes.index') }}"
                   class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.nodes.*')
                             ? 'bg-rose-50/90 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-200' }}">
                    <svg class="mr-3 h-5 w-5 flex-shrink-0 {{ request()->routeIs('admin.nodes.*') ? 'text-rose-600 dark:text-rose-300' : 'text-slate-400 dark:text-slate-400' }}"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    Nodes
                </a>
            </nav>

            {{-- User Profile --}}
            <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-800" x-data="{ openProfile: false }">
                @auth
                <div class="relative">
                    <button @click="openProfile = !openProfile"
                            class="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none text-left">
                        <div class="flex items-center gap-3">
                            <div class="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm shrink-0">
                                {{ substr(Auth::user()->name, 0, 1) }}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ Auth::user()->name }}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-500 truncate">{{ Auth::user()->email }}</p>
                            </div>
                        </div>
                        <svg class="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                        </svg>
                    </button>
                    <div x-show="openProfile" @click.away="openProfile = false" style="display: none;"
                         class="absolute bottom-full mb-2 w-full left-0 rounded-xl shadow-lg bg-white dark:bg-[#1c1c1f] border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
                        <div class="py-1">
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit" class="block w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Sign out</button>
                            </form>
                        </div>
                    </div>
                </div>
                @endauth
            </div>
        </aside>

        {{-- ===== MOBILE SIDEBAR OVERLAY ===== --}}
        <div x-show="mobileSidebarOpen"
             x-transition:enter="transition-opacity ease-linear duration-200"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave="transition-opacity ease-linear duration-200"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             @click="mobileSidebarOpen = false"
             style="display: none;"
             class="md:hidden fixed inset-0 bg-black/50 z-40">
        </div>

        {{-- Mobile Sidebar Panel --}}
        <div x-show="mobileSidebarOpen"
             x-transition:enter="transition ease-in-out duration-300 transform"
             x-transition:enter-start="-translate-x-full"
             x-transition:enter-end="translate-x-0"
             x-transition:leave="transition ease-in-out duration-300 transform"
             x-transition:leave-start="translate-x-0"
             x-transition:leave-end="-translate-x-full"
             style="display: none;"
             class="admin-sidebar md:hidden fixed inset-y-0 left-0 w-72 border-r border-sky-100 dark:border-cyan-900/40 z-50 flex flex-col shadow-xl">

            {{-- Mobile Sidebar Header --}}
            <div class="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
                <a href="{{ route('home') }}" class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg shrink-0 overflow-hidden bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">S</div>
                    <span class="text-base font-semibold text-gray-900 dark:text-white">{{ config('app.name', 'SARAH') }}</span>
                </a>
                <button @click="mobileSidebarOpen = false" class="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            {{-- Mobile Nav --}}
            <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div class="px-2 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overview</div>

                <a href="{{ route('admin.dashboard') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                          {{ request()->routeIs('admin.dashboard')
                             ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
                             : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.dashboard') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dashboard
                </a>

                <div x-data="{ open: {{ request()->routeIs('admin.tickets.*') ? 'true' : 'false' }} }" class="space-y-1">
                    <button @click="open = !open"
                       class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                              {{ request()->routeIs('admin.tickets.*')
                                 ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200'
                                 : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10' }}">
                        <div class="flex items-center">
                            <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.tickets.*') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Tickets
                        </div>
                        <svg class="w-4 h-4 transition-transform duration-200" :class="open ? 'rotate-180' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    <div x-show="open" style="display: none;" class="space-y-1 pb-1">
                        <a href="{{ route('admin.tickets.index') }}"
                           class="flex items-center pl-11 pr-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.tickets.index') ? 'text-cyan-700 dark:text-cyan-200 bg-cyan-50/60 dark:bg-cyan-500/15' : 'text-slate-500 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-500/10' }}">
                            Board
                        </a>
                        <a href="{{ route('admin.tickets.create') }}"
                           class="flex items-center pl-11 pr-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.tickets.create') ? 'text-cyan-700 dark:text-cyan-200 bg-cyan-50/60 dark:bg-cyan-500/15' : 'text-slate-500 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-50 dark:hover:bg-sky-500/10' }}">
                            New Ticket
                        </a>
                    </div>
                </div>

                <div class="px-2 mt-6 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Operations</div>

                <a href="{{ route('admin.helpdesk.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.helpdesk.*') ? 'bg-amber-50/90 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200' : 'text-slate-600 dark:text-slate-300 hover:bg-amber-50/80 dark:hover:bg-amber-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.helpdesk.*') ? 'text-amber-600 dark:text-amber-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Helpdesk
                </a>

                <a href="{{ route('admin.eos.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.eos.*') ? 'bg-emerald-50/90 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-200' : 'text-slate-600 dark:text-slate-300 hover:bg-emerald-50/80 dark:hover:bg-emerald-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.eos.*') ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    EOS Updates
                </a>

                <a href="{{ route('admin.reports.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.reports.*') ? 'bg-fuchsia-50/90 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-200' : 'text-slate-600 dark:text-slate-300 hover:bg-fuchsia-50/80 dark:hover:bg-fuchsia-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.reports.*') ? 'text-fuchsia-600 dark:text-fuchsia-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Reports
                </a>

                <a href="{{ route('admin.notifications.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.notifications.*') ? 'bg-violet-50/90 dark:bg-violet-500/20 text-violet-700 dark:text-violet-200' : 'text-slate-600 dark:text-slate-300 hover:bg-violet-50/80 dark:hover:bg-violet-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.notifications.*') ? 'text-violet-600 dark:text-violet-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notifications
                </a>

                <div class="px-2 mt-6 mb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Admin</div>

                <a href="{{ route('admin.users.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.users.*') ? 'bg-teal-50/90 dark:bg-teal-500/20 text-teal-700 dark:text-teal-200' : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50/80 dark:hover:bg-teal-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.users.*') ? 'text-teal-600 dark:text-teal-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5V9H2v11h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Users
                </a>

                <a href="{{ route('admin.audit.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.audit.*') ? 'bg-cyan-50/90 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-200' : 'text-slate-600 dark:text-slate-300 hover:bg-sky-50/80 dark:hover:bg-sky-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.audit.*') ? 'text-cyan-600 dark:text-cyan-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Audit Logs
                </a>

                <a href="{{ route('admin.integrations.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.integrations.*') ? 'bg-indigo-50/90 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200' : 'text-slate-600 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-indigo-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.integrations.*') ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    Integrations
                </a>

                <a href="{{ route('admin.nodes.index') }}"
                   class="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ request()->routeIs('admin.nodes.*') ? 'bg-rose-50/90 dark:bg-rose-500/20 text-rose-700 dark:text-rose-200' : 'text-slate-600 dark:text-slate-300 hover:bg-rose-50/80 dark:hover:bg-rose-500/10' }}">
                    <svg class="mr-3 h-5 w-5 {{ request()->routeIs('admin.nodes.*') ? 'text-rose-600 dark:text-rose-300' : 'text-slate-400 dark:text-slate-400' }}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    Nodes
                </a>
            </nav>

            {{-- Mobile User Info --}}
            @auth
            <div class="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
                <div class="flex items-center gap-3 p-2">
                    <div class="h-9 w-9 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm shrink-0">
                        {{ substr(Auth::user()->name, 0, 1) }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{{ Auth::user()->name }}</p>
                        <p class="text-xs text-gray-500 truncate">{{ Auth::user()->email }}</p>
                    </div>
                </div>
                <div class="mt-2 space-y-1">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="block w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Sign out</button>
                    </form>
                </div>
            </div>
            @endauth
        </div>

        {{-- ===== MAIN CONTENT AREA ===== --}}
        <div class="flex-1 flex flex-col min-w-0 min-h-0 bg-white/65 dark:bg-slate-900/40 transition-colors duration-300">

            {{-- Mobile Top Bar --}}
            <div class="md:hidden flex items-center justify-between bg-white/80 dark:bg-slate-900/50 border-b border-sky-100 dark:border-cyan-900/40 px-4 py-3 backdrop-blur-sm transition-colors duration-300">
                <button @click="mobileSidebarOpen = true" class="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <span class="text-base font-semibold text-gray-900 dark:text-white">{{ config('app.name', 'SARAH') }}</span>
                <button onclick="toggleAdminTheme()" class="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none">
                    <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
            </div>

            @hasSection('header')
                <header class="bg-white/75 dark:bg-slate-900/45 border-b border-sky-100 dark:border-cyan-900/40 backdrop-blur-sm flex items-center z-10 flex-shrink-0 min-h-16 px-6 md:px-8 transition-colors duration-300">
                    <div class="w-full flex items-center gap-3">
                        <div class="flex-1 min-w-0">
                            @yield('header')
                        </div>
                        <button onclick="toggleAdminTheme()"
                                class="hidden md:flex flex-shrink-0 p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
                                aria-label="Toggle Dark Mode">
                            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        </button>
                    </div>
                </header>
            @endif

            <main class="flex-1 min-h-0 overflow-y-auto bg-transparent focus:outline-none p-6 md:p-8 transition-colors duration-300">
                @yield('content')
            </main>
        </div>

    </body>
</html>
