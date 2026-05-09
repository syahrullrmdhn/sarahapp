<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Complete Registration - SARAH</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="text-center mb-8">
                <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span class="text-white font-bold text-xl">RS</span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Welcome to SARAH</h1>
                <p class="text-gray-600">
                    Hello, <strong>{{ $name }}</strong>!<br>
                    Please set your password to complete your registration.
                </p>
            </div>

            <form id="password-form" class="space-y-4">
                <input type="hidden" name="token" value="{{ $token }}">

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minlength="10"
                        class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Enter your password (min 10 characters)"
                    />
                </div>

                <div>
                    <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm Password
                    </label>
                    <input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        required
                        minlength="10"
                        class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        placeholder="Confirm your password"
                    />
                </div>

                <div id="error-message" class="hidden rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                </div>

                <div id="success-message" class="hidden rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
                </div>

                <button
                    type="submit"
                    id="submit-btn"
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-3 px-4 transition-colors shadow-lg shadow-blue-600/20"
                >
                    Complete Registration
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-sm text-gray-500">
                    Already have an account?
                    <a href="{{ route('login') }}" class="font-medium text-blue-600 hover:text-blue-700">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    </div>

    <script>
        const form = document.getElementById('password-form');
        const submitBtn = document.getElementById('submit-btn');
        const errorMsg = document.getElementById('error-message');
        const successMsg = document.getElementById('success-message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const token = formData.get('token');
            const password = formData.get('password');
            const passwordConfirmation = formData.get('password_confirmation');

            if (password !== passwordConfirmation) {
                showError('Passwords do not match');
                return;
            }

            if (password.length < 10) {
                showError('Password must be at least 10 characters');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
            hideError();
            hideSuccess();

            try {
                const response = await fetch(`/accept-invitation/${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content
                    },
                    body: JSON.stringify({
                        password: password,
                        password_confirmation: passwordConfirmation
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    showSuccess(data.message);
                    setTimeout(() => {
                        window.location.href = data.redirect;
                    }, 1500);
                } else {
                    showError(data.message || 'Failed to complete registration');
                }
            } catch (error) {
                showError('An error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Complete Registration';
            }
        });

        function showError(message) {
            errorMsg.textContent = message;
            errorMsg.classList.remove('hidden');
        }

        function hideError() {
            errorMsg.classList.add('hidden');
        }

        function showSuccess(message) {
            successMsg.textContent = message;
            successMsg.classList.remove('hidden');
        }

        function hideSuccess() {
            successMsg.classList.add('hidden');
        }
    </script>
</body>
</html>