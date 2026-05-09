@extends('layouts.admin')

@section('title', 'Reports')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Operations Reports</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">View performance metrics and operational reports.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
