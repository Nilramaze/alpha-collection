<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => 'required|string',
            'password' => 'required|string',
        ]);

        $identifier = $request->identifier;
        $user = filter_var($identifier, FILTER_VALIDATE_EMAIL)
            ? User::where('email', $identifier)->first()
            : User::where('username', $identifier)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'identifier' => ['Die angegebenen Anmeldedaten sind ungültig.'],
            ]);
        }

        // Revoke existing tokens
        $user->tokens()->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        $user->load('skontoGroup.tiers');

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Erfolgreich abgemeldet.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('skontoGroup.tiers');

        return response()->json([
            'user' => new UserResource($user),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success to avoid user enumeration
        if (!$user) {
            return response()->json(['message' => 'Falls ein Konto mit dieser E-Mail existiert, wurde eine Nachricht gesendet.']);
        }

        // Delete old tokens for this email
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        $rawToken = Str::random(64);
        DB::table('password_reset_tokens')->insert([
            'email'      => $user->email,
            'token'      => Hash::make($rawToken),
            'created_at' => now(),
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'https://alphacollection.de'), '/');
        $resetUrl = $frontendUrl . '/passwort-reset?token=' . $rawToken . '&email=' . urlencode($user->email);

        $body = "Hallo {$user->name},\n\n"
            . "Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.\n\n"
            . "Klicken Sie auf den folgenden Link, um ein neues Passwort zu vergeben:\n\n"
            . $resetUrl . "\n\n"
            . "Dieser Link ist 60 Minuten gültig. Wenn Sie kein Passwort zurücksetzen möchten, können Sie diese E-Mail ignorieren.\n\n"
            . "Mit freundlichen Grüßen\nAlpha Collection";

        try {
            Mail::raw($body, function ($m) use ($user) {
                $m->to($user->email, $user->name)->subject('Passwort zurücksetzen – Alpha Collection');
            });
        } catch (\Throwable $e) {
            Log::error('Password reset mail failed: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Falls ein Konto mit dieser E-Mail existiert, wurde eine Nachricht gesendet.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->first();

        if (!$record || !Hash::check($data['token'], $record->token)) {
            return response()->json(['message' => 'Der Reset-Link ist ungültig oder abgelaufen.'], 422);
        }

        // Token expires after 60 minutes
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
            return response()->json(['message' => 'Der Reset-Link ist abgelaufen. Bitte fordern Sie einen neuen an.'], 422);
        }

        $user = User::where('email', $data['email'])->first();
        if (!$user) {
            return response()->json(['message' => 'Benutzer nicht gefunden.'], 422);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        $user->tokens()->delete(); // Revoke all active sessions

        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

        return response()->json(['message' => 'Passwort erfolgreich zurückgesetzt. Sie können sich jetzt anmelden.']);
    }

    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }
}
