@extends('layouts.admin')

@section('title', 'Users')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-teal-100 dark:border-teal-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-teal-600 dark:text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5V9H2v11h5m10 0v-2a4 4 0 00-4-4H11a4 4 0 00-4 4v2m10 0H7m10-11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage system users, roles, and permissions.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
