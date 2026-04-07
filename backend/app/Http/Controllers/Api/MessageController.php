<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $messages = $request->user()->messages()
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json(
            MessageResource::collection($messages)->response()->getData(true)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string|max:5000',
        ]);

        $message = $request->user()->messages()->create([
            'subject' => $request->subject,
            'content' => $request->content,
            'status' => 'open',
        ]);

        $this->sendMessageNotification($message, $request->user());

        return response()->json([
            'data' => new MessageResource($message),
            'message' => 'Nachricht erfolgreich gesendet.',
        ], 201);
    }

    private function sendMessageNotification(Message $message, $user): void
    {
        if (!Setting::get('notify_on_message')) return;

        $email = Setting::get('notification_email');
        if (!$email) return;

        $body = "Neue Nachricht eingegangen!\n\n"
            . "Von:     {$user->name} <{$user->email}>\n"
            . "Betreff: {$message->subject}\n\n"
            . $message->content . "\n";

        try {
            Mail::raw($body, function ($m) use ($email, $message) {
                $m->to($email)->subject("Neue Nachricht: {$message->subject}");
            });
        } catch (\Throwable $e) {
            Log::error('Message notification mail failed: ' . $e->getMessage());
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $message = $request->user()->messages()->findOrFail($id);

        return response()->json([
            'data' => new MessageResource($message),
        ]);
    }
}
