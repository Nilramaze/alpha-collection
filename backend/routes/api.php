<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\MessageController as AdminMessageController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\SkontoGroupController as AdminSkontoGroupController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\AnnouncementController as AdminAnnouncementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (no auth required)
|--------------------------------------------------------------------------
*/
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Announcements (public – only enabled ones)
Route::get('/announcements', [AnnouncementController::class, 'index']);

// Products are publicly visible (prices hidden for guests via Resource)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{idOrSlug}', [ProductController::class, 'show']);
Route::get('/categories', [ProductController::class, 'categories']);

/*
|--------------------------------------------------------------------------
| Protected Routes (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Address
    Route::get('/address', [AddressController::class, 'show']);
    Route::put('/address', [AddressController::class, 'update']);

    // Cart
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::post('/cart/update', [CartController::class, 'update']);
    Route::post('/cart/remove', [CartController::class, 'remove']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);

    // Messages
    Route::get('/messages', [MessageController::class, 'index']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);

    // Admin
    Route::middleware(\App\Http\Middleware\EnsureUserIsAdmin::class)->prefix('admin')->group(function () {
        Route::get('/skonto-groups', [AdminUserController::class, 'skontoGroups']);
        Route::apiResource('users', AdminUserController::class);
        Route::apiResource('products', AdminProductController::class);
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::patch('/orders/{order}', [AdminOrderController::class, 'update']);
        Route::post('/orders/{order}/cancel', [AdminOrderController::class, 'cancel']);
        Route::get('/messages', [AdminMessageController::class, 'index']);
        Route::patch('/messages/{message}', [AdminMessageController::class, 'update']);
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);
        // Announcements admin (reorder must be before {announcement} to avoid wildcard match)
        Route::get('/announcements', [AdminAnnouncementController::class, 'index']);
        Route::post('/announcements', [AdminAnnouncementController::class, 'store']);
        Route::post('/announcements/reorder', [AdminAnnouncementController::class, 'reorder']);
        Route::post('/announcements/{announcement}', [AdminAnnouncementController::class, 'update']);
        Route::patch('/announcements/{announcement}', [AdminAnnouncementController::class, 'toggle']);
        Route::delete('/announcements/{announcement}', [AdminAnnouncementController::class, 'destroy']);
        Route::apiResource('categories', AdminCategoryController::class)->except(['show']);
        Route::apiResource('skonto-groups', AdminSkontoGroupController::class)->except(['show']);
        Route::post('/skonto-groups/{skontoGroup}/tiers', [AdminSkontoGroupController::class, 'storeTier']);
        Route::put('/skonto-groups/{skontoGroup}/tiers/{tier}', [AdminSkontoGroupController::class, 'updateTier']);
        Route::delete('/skonto-groups/{skontoGroup}/tiers/{tier}', [AdminSkontoGroupController::class, 'destroyTier']);
    });
});
