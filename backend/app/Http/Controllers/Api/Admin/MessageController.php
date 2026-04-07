<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = Message::with('user')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(
            MessageResource::collection($messages)->response()->getData(true)
        );
    }

    public function update(Request $request, Message $message): JsonResponse
    {
        $data = $request->validate([
            'status'      => 'sometimes|in:open,closed',
            'admin_reply' => 'nullable|string|max:5000',
        ]);
        $message->update($data);
        return response()->json(['data' => new MessageResource($message->load('user'))]);
    }
}
