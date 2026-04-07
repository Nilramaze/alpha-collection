<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'stock_green_min'       => (int) Setting::get('stock_green_min', 100),
                'stock_yellow_min'      => (int) Setting::get('stock_yellow_min', 1),
                'notification_email'    => Setting::get('notification_email', ''),
                'notify_on_order'       => (bool) Setting::get('notify_on_order', false),
                'notify_on_message'     => (bool) Setting::get('notify_on_message', false),
            ]
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'stock_green_min'       => 'required|integer|min:1',
            'stock_yellow_min'      => 'required|integer|min:1',
            'notification_email'    => 'nullable|email|max:255',
            'notify_on_order'       => 'boolean',
            'notify_on_message'     => 'boolean',
        ]);

        Setting::set('stock_green_min',    $data['stock_green_min']);
        Setting::set('stock_yellow_min',   $data['stock_yellow_min']);
        Setting::set('notification_email', $data['notification_email'] ?? '');
        Setting::set('notify_on_order',    ($data['notify_on_order'] ?? false) ? '1' : '0');
        Setting::set('notify_on_message',  ($data['notify_on_message'] ?? false) ? '1' : '0');

        return response()->json(['message' => 'Einstellungen gespeichert.', 'data' => $data]);
    }
}
