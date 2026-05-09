@extends('layouts.admin')

@section('title', 'EOS Updates')

@section('content')
    <div class="mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-8 shadow-sm text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">EOS Updates</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Post updates and communicate with customers.</p>
            <a href="{{ route('admin.dashboard') }}" class="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                &larr; Back to Dashboard
            </a>
        </div>
    </div>
@endsection
