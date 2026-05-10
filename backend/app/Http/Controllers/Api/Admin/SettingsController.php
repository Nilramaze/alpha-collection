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
                'color_page_bg'         => Setting::get('color_page_bg', '#f0f0ee'),
                'color_topbar'          => Setting::get('color_topbar', '#0e0e0e'),
                'color_sidebar'         => Setting::get('color_sidebar', '#0e0e0e'),
                'color_accent'          => Setting::get('color_accent', '#8eff71'),
                'mwst_rate'             => (float) Setting::get('mwst_rate', 19),
            ]
        ]);
    }

    public function publicIndex(): JsonResponse
    {
        return response()->json([
            'data' => [
                'color_page_bg'  => Setting::get('color_page_bg', '#f0f0ee'),
                'color_topbar'   => Setting::get('color_topbar', '#0e0e0e'),
                'color_sidebar'  => Setting::get('color_sidebar', '#0e0e0e'),
                'color_accent'   => Setting::get('color_accent', '#8eff71'),
                'mwst_rate'      => (float) Setting::get('mwst_rate', 19),
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
            'color_page_bg'         => 'nullable|string|max:20',
            'color_topbar'          => 'nullable|string|max:20',
            'color_sidebar'         => 'nullable|string|max:20',
            'color_accent'          => 'nullable|string|max:20',
            'mwst_rate'             => 'nullable|numeric|min:0|max:100',
        ]);

        Setting::set('stock_green_min',    $data['stock_green_min']);
        Setting::set('stock_yellow_min',   $data['stock_yellow_min']);
        Setting::set('notification_email', $data['notification_email'] ?? '');
        Setting::set('notify_on_order',    ($data['notify_on_order'] ?? false) ? '1' : '0');
        Setting::set('notify_on_message',  ($data['notify_on_message'] ?? false) ? '1' : '0');
        if (isset($data['color_page_bg']))  Setting::set('color_page_bg',  $data['color_page_bg']);
        if (isset($data['color_topbar']))   Setting::set('color_topbar',   $data['color_topbar']);
        if (isset($data['color_sidebar']))  Setting::set('color_sidebar',  $data['color_sidebar']);
        if (isset($data['color_accent']))   Setting::set('color_accent',   $data['color_accent']);
        if (isset($data['mwst_rate']))      Setting::set('mwst_rate',      $data['mwst_rate']);

        return response()->json(['message' => 'Einstellungen gespeichert.', 'data' => $data]);
    }
}
