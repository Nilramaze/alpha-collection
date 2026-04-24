<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\AnnouncementController as PublicAnnouncementController;
use App\Models\Announcement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function index(): JsonResponse
    {
        $items = Announcement::orderBy('sort_order')->get()
            ->map(fn($a) => PublicAnnouncementController::format($a));

        return response()->json(['data' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'            => 'required|string|max:255',
            'text'             => 'nullable|string|max:2000',
            'image'            => 'nullable|image|max:5120',
            'title_size'       => 'nullable|string|max:10',
            'text_size'        => 'nullable|string|max:10',
            'background_color' => 'nullable|string|max:20',
        ]);

        $maxOrder = Announcement::max('sort_order') ?? -1;

        $ann = Announcement::create([
            'title'            => $request->input('title'),
            'text'             => $request->input('text', ''),
            'title_size'       => $request->input('title_size', '48'),
            'text_size'        => $request->input('text_size', '18'),
            'background_color' => $request->input('background_color', '#0e0e0e'),
            'enabled'          => false,
            'sort_order'       => $maxOrder + 1,
            'gallery_images'   => [],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            $ann->update(['image_url' => '/storage/' . $path]);
        }

        $this->handleGallery($request, $ann);

        return response()->json(['data' => PublicAnnouncementController::format($ann->fresh())], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $request->validate([
            'title'            => 'sometimes|required|string|max:255',
            'text'             => 'nullable|string|max:2000',
            'image'            => 'nullable|image|max:5120',
            'title_size'       => 'nullable|string|max:10',
            'text_size'        => 'nullable|string|max:10',
            'background_color' => 'nullable|string|max:20',
        ]);

        $data = [];
        foreach (['title', 'text', 'title_size', 'text_size', 'background_color'] as $field) {
            if ($request->has($field)) {
                $data[$field] = $request->input($field);
            }
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('announcements', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $announcement->update($data);
        $this->handleGallery($request, $announcement);

        return response()->json(['data' => PublicAnnouncementController::format($announcement->fresh())]);
    }

    public function toggle(Request $request, Announcement $announcement): JsonResponse
    {
        $announcement->update(['enabled' => $request->boolean('enabled')]);
        return response()->json(['data' => PublicAnnouncementController::format($announcement->fresh())]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate(['ids' => 'required|array']);

        foreach ($request->input('ids') as $order => $id) {
            Announcement::where('id', $id)->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Reihenfolge gespeichert.']);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $announcement->delete();
        return response()->json(['message' => 'Ankündigung gelöscht.']);
    }

    private function handleGallery(Request $request, Announcement $announcement): void
    {
        $gallery = $announcement->gallery_images ?? [];
        // Ensure 5 slots
        while (count($gallery) < 5) {
            $gallery[] = null;
        }

        for ($i = 1; $i <= 5; $i++) {
            $idx = $i - 1;
            if ($request->input("remove_gallery_{$i}")) {
                $gallery[$idx] = null;
            } elseif ($request->hasFile("gallery_{$i}")) {
                $path = $request->file("gallery_{$i}")->store('announcements/gallery', 'public');
                $gallery[$idx] = '/storage/' . $path;
            }
        }

        $announcement->update(['gallery_images' => $gallery]);
    }
}
