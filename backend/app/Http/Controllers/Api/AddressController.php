<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AddressController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'delivery_company'          => $user->delivery_company,
                'delivery_street'           => $user->delivery_street,
                'delivery_zip'              => $user->delivery_zip,
                'delivery_city'             => $user->delivery_city,
                'delivery_country'          => $user->delivery_country ?? 'Deutschland',
                'billing_same_as_delivery'  => (bool) ($user->billing_same_as_delivery ?? true),
                'billing_company'           => $user->billing_company,
                'billing_street'            => $user->billing_street,
                'billing_zip'               => $user->billing_zip,
                'billing_city'              => $user->billing_city,
                'billing_country'           => $user->billing_country,
            ],
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'delivery_company'          => 'nullable|string|max:255',
            'delivery_street'           => 'required|string|max:255',
            'delivery_zip'              => 'required|string|max:20',
            'delivery_city'             => 'required|string|max:255',
            'delivery_country'          => 'required|string|max:255',
            'billing_same_as_delivery'  => 'required|boolean',
            'billing_company'           => 'nullable|string|max:255',
            'billing_street'            => 'nullable|string|max:255',
            'billing_zip'               => 'nullable|string|max:20',
            'billing_city'              => 'nullable|string|max:255',
            'billing_country'           => 'nullable|string|max:255',
        ]);

        $request->user()->update($data);

        return response()->json(['message' => 'Adressen gespeichert.']);
    }
}
