@extends('layouts.admin')

@section('title', 'Dashboard')

@section('content')
    <div class="mx-auto">
        {{-- Stats Row --}}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white dark:bg-[#111113] border border-sky-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Open Tickets</p>
                        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $openTickets ?? 0 }}</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-cyan-600 dark:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#111113] border border-sky-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Response Compliance</p>
                        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $responseCompliance ?? 0 }}%</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#111113] border border-sky-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Helpdesk Reports</p>
                        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ $helpdeskCount ?? 0 }}</p>
                    </div>
                    <div class="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                        <svg class="w-6 h-6 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        {{-- Ticket Overview / Recent Activity --}}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {{-- Ticket Board Summary --}}
            <div class="bg-white dark:bg-[#111113] border border-sky-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Ticket Board</h3>
                    <a href="{{ route('admin.tickets.index') }}" class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">View all</a>
                </div>
                <div class="space-y-3">
                    @php
                        $boardColumns = [
                            ['label' => 'New', 'key' => 'new', 'color' => 'bg-blue-500'],
                            ['label' => 'Acknowledged', 'key' => 'acknowledged', 'color' => 'bg-amber-500'],
                            ['label' => 'Escalated', 'key' => 'escalated', 'color' => 'bg-red-500'],
                            ['label' => 'Closed', 'key' => 'closed', 'color' => 'bg-emerald-500'],
                        ];
                    @endphp
                    @foreach($boardColumns as $col)
                        <div class="flex items-center justify-between py-2">
                            <div class="flex items-center gap-3">
                                <span class="w-2.5 h-2.5 rounded-full {{ $col['color'] }}"></span>
                                <span class="text-sm text-gray-600 dark:text-gray-400">{{ $col['label'] }}</span>
                            </div>
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">
                                {{ $boardCounts[$col['key']] ?? 0 }}
                            </span>
                        </div>
                    @endforeach
                    <div class="border-t border-gray-100 dark:border-gray-800 pt-3 mt-3">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                            <span class="text-sm font-bold text-gray-900 dark:text-white">{{ $boardCounts['total'] ?? 0 }}</span>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Recent Activity --}}
            <div class="bg-white dark:bg-[#111113] border border-sky-100 dark:border-cyan-900/30 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Integrations</h3>
                    <a href="{{ route('admin.integrations.index') }}" class="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">Manage</a>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                                <svg class="w-5 h-5 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Webhook Sources</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{ $integrations['webhook_sources_count'] ?? 0 }} sources</p>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
                                <svg class="w-5 h-5 text-sky-600 dark:text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-900 dark:text-white">Telegram Bot</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">{{ isset($integrations['telegram']) && $integrations['telegram'] ? 'Connected' : 'Not configured' }}</p>
                            </div>
                        </div>
                        @if(isset($integrations['telegram']) && $integrations['telegram'])
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Active
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        {{-- Quick Actions --}}
        <div class="flex flex-wrap gap-3">
            <a href="{{ route('admin.tickets.create') }}" class="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
            </a>
            <a href="{{ route('admin.helpdesk.index') }}" class="inline-flex items-center gap-2 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-5 py-2.5 text-sm font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Helpdesk Report
            </a>
        </div>
    </div>
@endsection
