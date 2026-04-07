<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SkontoGroup;
use App\Models\SkontoTier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SkontoGroupController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => SkontoGroup::with('tiers', 'users')->withCount('users')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:skonto_groups,name',
        ]);

        $group = SkontoGroup::create($data);

        return response()->json(['data' => $group->load('tiers')], 201);
    }

    public function update(Request $request, SkontoGroup $skontoGroup): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:skonto_groups,name,' . $skontoGroup->id,
        ]);

        $skontoGroup->update($data);

        return response()->json(['data' => $skontoGroup->load('tiers')]);
    }

    public function destroy(SkontoGroup $skontoGroup): JsonResponse
    {
        if ($skontoGroup->users()->exists()) {
            return response()->json([
                'message' => 'Gruppe kann nicht gelöscht werden – es sind noch Benutzer zugewiesen.',
            ], 422);
        }

        $skontoGroup->delete();

        return response()->json(['message' => 'Gruppe gelöscht.']);
    }

    // ── Tiers ──────────────────────────────────────

    public function storeTier(Request $request, SkontoGroup $skontoGroup): JsonResponse
    {
        $data = $request->validate([
            'min_order_value'  => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0.01|max:100',
        ]);

        $tier = $skontoGroup->tiers()->create($data);

        return response()->json(['data' => $tier], 201);
    }

    public function updateTier(Request $request, SkontoGroup $skontoGroup, SkontoTier $tier): JsonResponse
    {
        abort_if($tier->skonto_group_id !== $skontoGroup->id, 404);

        $data = $request->validate([
            'min_order_value'  => 'required|numeric|min:0',
            'discount_percent' => 'required|numeric|min:0.01|max:100',
        ]);

        $tier->update($data);

        return response()->json(['data' => $tier]);
    }

    public function destroyTier(SkontoGroup $skontoGroup, SkontoTier $tier): JsonResponse
    {
        abort_if($tier->skonto_group_id !== $skontoGroup->id, 404);

        $tier->delete();

        return response()->json(['message' => 'Staffel gelöscht.']);
    }
}
