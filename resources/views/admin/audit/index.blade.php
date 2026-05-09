@extends('layouts.admin')

@section('title', 'Audit Logs')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-cyan-100 dark:border-cyan-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-cyan-50 dark:bg-cyan-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-cyan-600 dark:text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Audit Logs</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Track system activity and changes.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
