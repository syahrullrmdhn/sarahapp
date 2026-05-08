<!doctype html>
<html lang="en" class="h-full">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>SARAH - Smart Automated Response & Alerting Hub</title>
    <script>
        // Prevent theme flash by setting the theme before CSS loads.
        (function () {
            try {
                var stored = localStorage.getItem('sarah_theme');
                var preferDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                var theme = stored ? stored : (preferDark ? 'dark' : 'light');
                document.documentElement.dataset.theme = theme;
            } catch (e) {
                // ignore
            }
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="h-full">
    <div id="app" class="h-full"></div>
</body>
</html>
