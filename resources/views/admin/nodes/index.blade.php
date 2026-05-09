@extends('layouts.admin')

@section('title', 'Nodes')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-rose-100 dark:border-rose-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-rose-600 dark:text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nodes</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage monitoring nodes and infrastructure.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
