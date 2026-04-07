<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'data' => [
                'enabled'   => (bool) Setting::get('announcement_enabled', false),
                'title'     => Setting::get('announcement_title', ''),
                'text'      => Setting::get('announcement_text', ''),
                'image_url' => Setting::get('announcement_image_url', null),
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'enabled'   => 'required|boolean',
            'title'     => 'required|string|max:255',
            'text'      => 'nullable|string|max:2000',
            'image'     => 'nullable|image|max:5120',
        ]);

        Setting::set('announcement_enabled', $request->boolean('enabled') ? '1' : '0');
        Setting::set('announcement_title',   $request->input('title'));
        Setting::set('announcement_text',    $request->input('text', ''));

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            Setting::set('announcement_image_url', '/storage/' . $path);
        }

        return response()->json(['message' => 'Ankündigung gespeichert.']);
    }
}
