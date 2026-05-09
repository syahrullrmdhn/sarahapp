@extends('layouts.admin')

@section('title', 'New Ticket')

@section('content')
    <div class="max-w-3xl mx-auto">
        <div class="bg-white dark:bg-[#111113] border border-cyan-100 dark:border-cyan-900/30 rounded-2xl shadow-sm overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create New Ticket</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details to create a new support ticket.</p>
            </div>

            <form class="p-6 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
                        <input type="text" id="title" class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all" placeholder="Brief description of the issue">
                    </div>

                    <div>
                        <label for="priority" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                        <select id="priority" class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all">
                            <option>P1 - Critical</option>
                            <option selected>P2 - High</option>
                            <option>P3 - Medium</option>
                            <option>P4 - Low</option>
                            <option>P5 - Informational</option>
                        </select>
                    </div>

                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                        <select id="category" class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all">
                            <option>Network</option>
                            <option>Hardware</option>
                            <option>Software</option>
                            <option>Security</option>
                            <option>Other</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                    <textarea id="description" rows="5" class="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all resize-y" placeholder="Detailed description of the issue..."></textarea>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <a href="{{ route('admin.tickets.index') }}" class="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Create Ticket
                    </button>
                </div>
            </form>
        </div>
    </div>
@endsection
