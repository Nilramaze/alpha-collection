<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\SkontoGroup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $users = User::with('skontoGroup')
            ->when($request->search, fn($q) => $q->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('email', 'LIKE', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(
            UserResource::collection($users)->response()->getData(true)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|string|min:8',
            'role'            => 'required|in:admin,user',
            'skonto_group_id' => 'nullable|exists:skonto_groups,id',
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
        ]);

        return response()->json(['data' => new UserResource($user->load('skontoGroup'))], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name'            => 'sometimes|string|max:255',
            'email'           => 'sometimes|email|unique:users,email,' . $user->id,
            'password'        => 'sometimes|nullable|string|min:8',
            'role'            => 'sometimes|in:admin,user',
            'is_active'       => 'sometimes|boolean',
            'skonto_group_id' => 'nullable|exists:skonto_groups,id',
        ]);

        if (isset($data['password']) && $data['password']) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['data' => new UserResource($user->fresh('skontoGroup'))]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->tokens()->delete();
        $user->delete();
        return response()->json(['message' => 'Benutzer gelöscht.']);
    }

    public function skontoGroups(): JsonResponse
    {
        return response()->json(['data' => SkontoGroup::all()]);
    }
}
