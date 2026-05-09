@extends('layouts.admin')

@section('title', 'Tickets')

@section('content')
    <div class="mx-auto">

        @if(session('status'))
            <div class="mb-6 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg border border-green-100 dark:border-green-800">
                {{ session('status') }}
            </div>
        @endif

        {{-- Filter / Search Bar --}}
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-2">
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Search tickets..." class="pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111113] text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all w-64">
                </div>
            </div>
            <a href="{{ route('admin.tickets.create') }}" class="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Ticket
            </a>
        </div>

        {{-- Tickets Table --}}
        <div class="overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm dark:border-cyan-900/30 dark:bg-[#111113]">
            <div class="overflow-x-auto rounded-2xl">
                <table class="w-full min-w-[800px] text-left">
                    <thead>
                        <tr class="border-b border-slate-100 bg-cyan-50/70 dark:border-slate-800 dark:bg-cyan-900/10">
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th class="py-3.5 px-6 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                        @forelse($tickets ?? [] as $ticket)
                        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                            <td class="py-4 px-6">
                                <span class="font-mono text-xs text-gray-400 dark:text-gray-500">#{{ $ticket->id }}</span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="font-medium text-gray-900 dark:text-gray-100 text-sm">{{ $ticket->title }}</div>
                            </td>
                            <td class="py-4 px-6">
                                @php
                                    $priorityColors = [
                                        'P1' => 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
                                        'P2' => 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/20',
                                        'P3' => 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-300 dark:border-yellow-500/20',
                                        'P4' => 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
                                        'P5' => 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
                                    ];
                                    $priorityClass = $priorityColors[$ticket->priority] ?? 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
                                @endphp
                                <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium {{ $priorityClass }}">
                                    {{ $ticket->priority }}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                @php
                                    $statusColors = [
                                        'new' => 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
                                        'acknowledged' => 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
                                        'escalated' => 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20',
                                        'closed' => 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
                                    ];
                                    $statusColorsDot = [
                                        'new' => 'bg-blue-500',
                                        'acknowledged' => 'bg-amber-500',
                                        'escalated' => 'bg-red-500',
                                        'closed' => 'bg-emerald-500',
                                    ];
                                    $statusClass = $statusColors[$ticket->status] ?? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
                                    $statusDot = $statusColorsDot[$ticket->status] ?? 'bg-gray-400';
                                @endphp
                                <span class="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {{ $statusClass }}">
                                    <span class="w-1.5 h-1.5 rounded-full {{ $statusDot }}"></span>
                                    {{ ucfirst($ticket->status) }}
                                </span>
                            </td>
                            <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                {{ $ticket->assigned_to ?? '—' }}
                            </td>
                            <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                                {{ $ticket->created_at ? \Carbon\Carbon::parse($ticket->created_at)->format('M d, Y') : '—' }}
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <a href="#" class="inline-flex items-center rounded-full border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-cyan-500/30 dark:hover:text-cyan-300">Edit</a>
                                    <form action="#" method="POST" onsubmit="return confirm('Delete this ticket?')">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="inline-flex items-center rounded-full border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:text-red-300 dark:hover:bg-red-500/10">Delete</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="7" class="py-16 text-center">
                                <div class="text-gray-400 dark:text-gray-600 text-sm">No tickets yet.</div>
                                <a href="{{ route('admin.tickets.create') }}" class="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-500/30 dark:text-cyan-300 dark:hover:bg-cyan-500/10">
                                    Create your first ticket
                                </a>
                            </td>
                        </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if(isset($tickets) && method_exists($tickets, 'hasPages') && $tickets->hasPages())
            <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                {{ $tickets->links() }}
            </div>
            @endif
        </div>
    </div>
@endsection
