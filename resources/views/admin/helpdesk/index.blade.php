@extends('layouts.admin')

@section('title', 'Helpdesk')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-amber-100 dark:border-amber-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Helpdesk Reports</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage helpdesk reports and inquiries.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
