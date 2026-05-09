@extends('layouts.guest')

@section('title', config('app.name', 'SARAH') . ' - Sign In')

@section('content')
    @if(session('status'))
        <div class="mb-4 text-emerald-600 dark:text-emerald-400 font-medium text-sm text-center">
            {{ session('status') }}
        </div>
    @endif

    <div class="mb-7 flex flex-col items-center text-center">
        <div class="mb-5 w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <span class="font-bold text-lg text-white">RS</span>
        </div>

        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1.5">
            Welcome back
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
            Please enter your details to sign in.
        </p>
    </div>

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
            </label>
            <input id="email"
                   class="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all duration-200"
                   type="email"
                   name="email"
                   value="{{ old('email') }}"
                   placeholder="name@example.com"
                   required autofocus autocomplete="username" />
            @if($errors->has('email'))
                <p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{{ $errors->first('email') }}</p>
            @endif
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
            </label>
            <input id="password"
                   class="block w-full rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all duration-200"
                   type="password"
                   name="password"
                   placeholder="••••••••"
                   required autocomplete="current-password" />
            @if($errors->has('password'))
                <p class="mt-1.5 text-sm text-red-600 dark:text-red-400">{{ $errors->first('password') }}</p>
            @endif
        </div>

        <div class="flex items-center pt-1">
            <label for="remember_me" class="flex items-center cursor-pointer group">
                <div class="relative flex items-center">
                    <input id="remember_me"
                           type="checkbox"
                           class="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800 checked:border-blue-600 checked:bg-blue-600 dark:checked:border-blue-500 dark:checked:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all"
                           name="remember">
                    <svg class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <span class="ml-2.5 text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                    Remember me
                </span>
            </label>
        </div>

        <div class="pt-2">
            <button type="submit" class="w-full inline-flex justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 transition-all duration-200">
                Sign in
            </button>
        </div>
    </form>

    @if(Route::has('register'))
    <div class="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don't have an account?
        <a href="{{ route('register') }}" class="font-medium text-gray-900 dark:text-white hover:underline underline-offset-4 transition-all">Create one now</a>
    </div>
    @endif
@endsection