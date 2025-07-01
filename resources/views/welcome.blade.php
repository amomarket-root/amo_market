<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Amo Market</title>
    <meta name="description" content="Amo Market">

    <!-- Preload critical resources -->
    <link rel="preload" href="{{ Vite::asset('resources/css/app.css') }}" as="style">
    <link rel="preload" href="{{ Vite::asset('resources/js/app.jsx') }}" as="script" crossorigin>
    <link rel="preload" href="/image/loader.gif" as="image">

    <!-- Font preload -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body>
    <div id="app">
        <!-- Initial loading state that matches our Suspense fallback -->
        <div class="loader-container">
            <img src="/image/loader.gif" alt="Loading..." class="loader" />
        </div>
    </div>
</body>
</html>
