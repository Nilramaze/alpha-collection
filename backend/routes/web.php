<?php

use Illuminate\Support\Facades\Route;

// Filament handles its own routes via the AdminPanelProvider
// SPA frontend is served by Vite dev server in development

Route::get('/{any?}', function () {
    return response()->json(['message' => 'Alpha Collection API. Use /api endpoints or /admin for the admin panel.']);
})->where('any', '^(?!api|admin|livewire).*');
