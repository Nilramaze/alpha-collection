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
        $cartQty = (int) ($request->query('cart_qty', 0));

        $options = ShippingOption::availableFor($cartQty)
            ->get()
            ->map(fn($s) => [
                'id'            => $s->id,
                'name'          => $s->name,
                'price'         => (float) $s->price,
                'image_url'     => $s->image_url,
                'min_order_qty' => $s->min_order_qty,
                'max_order_qty' => $s->max_order_qty,
            ]);

        return response()->json(['data' => $options]);
    }
}
