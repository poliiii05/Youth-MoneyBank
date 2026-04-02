<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title inertia>Bank Management System</title>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    <!-- ✅ Google Identity Services Script -->
    <script src="https://accounts.google.com/gsi/client" async defer></script>
    
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
</head>
<body class="antialiased">
    @inertia
</body>
</html>
