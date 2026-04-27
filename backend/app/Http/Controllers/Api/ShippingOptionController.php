<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShippingOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingOptionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $cartTotal = (float) ($request->query('cart_total', 0));

        $options = ShippingOption::availableFor($cartTotal)
            ->get()
            ->map(fn($s) => [
                'id'              => $s->id,
                'name'            => $s->name,
                'price'           => (float) $s->price,
                'image_url'       => $s->image_url,
                'min_order_value' => (float) $s->min_order_value,
                'max_order_value' => $s->max_order_value !== null ? (float) $s->max_order_value : null,
            ]);

        return response()->json(['data' => $options]);
    }
}
