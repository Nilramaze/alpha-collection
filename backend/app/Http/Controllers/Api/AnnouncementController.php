<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $announcements = Announcement::where('enabled', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn($a) => $this->format($a));

        return response()->json(['data' => $announcements]);
    }

    public static function format(Announcement $a): array
    {
        return [
            'id'               => $a->id,
            'title'            => $a->title,
            'text'             => $a->text,
            'image_url'        => $a->image_url,
            'gallery_images'   => $a->gallery_images ?? [],
            'title_size'       => $a->title_size,
            'text_size'        => $a->text_size,
            'background_color' => $a->background_color,
            'enabled'          => $a->enabled,
            'sort_order'       => $a->sort_order,
        ];
    }
}
