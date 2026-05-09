@extends('layouts.admin')

@section('title', 'Notifications')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-violet-100 dark:border-violet-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-violet-600 dark:text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Notification Logs</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">View sent notifications and delivery status.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
