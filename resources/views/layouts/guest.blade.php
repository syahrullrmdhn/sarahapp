<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="light">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <link rel="icon" type="image/svg+xml" href="/favicon.svg">

        <title>@yield('title', config('app.name', 'SARAH')) - Authentication</title>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <script>
            if (localStorage.sarah_theme === 'dark' || (!('sarah_theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
                document.documentElement.dataset.theme = 'dark';
            } else {
                document.documentElement.classList.remove('dark')
                document.documentElement.dataset.theme = 'light';
            }

            function toggleTheme() {
                if (document.documentElement.classList.contains('dark')) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.dataset.theme = 'light';
                    localStorage.sarah_theme = 'light';
                } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.dataset.theme = 'dark';
                    localStorage.sarah_theme = 'dark';
                }
            }
        </script>
    </head>

    <body class="guest-shell font-sans antialiased bg-gray-100 dark:bg-zinc-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex min-h-screen items-center justify-center p-4 relative">

        <button onclick="toggleTheme()" class="absolute top-6 right-6 p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-900 rounded-full transition-all focus:outline-none" aria-label="Toggle Dark Mode">
            <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            <svg class="w-5 h-5 block dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
        </button>

        <div class="w-full sm:max-w-[400px]">
            <div class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm p-7 sm:p-8">
                @yield('content')
            </div>
        </div>
    </body>
</html>