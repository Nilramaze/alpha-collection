<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private CartService $cartService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user());
        $skontoData = $this->cartService->calculateSkontoDiscount(
            $request->user(),
            $cart->total
        );

        return response()->json([
            'data' => new CartResource($cart),
            'skonto' => $skontoData,
        ]);
    }

    public function add(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'quantity'         => 'required|integer|min:1',
            'product_color_id' => 'nullable|exists:product_colors,id',
        ]);

        try {
            $cart = $this->cartService->addItem(
                $request->user(),
                $request->product_id,
                $request->quantity,
                $request->product_color_id
            );

            $skontoData = $this->cartService->calculateSkontoDiscount(
                $request->user(),
                $cart->total
            );

            return response()->json([
                'data' => new CartResource($cart),
                'skonto' => $skontoData,
                'message' => 'Produkt zum Warenkorb hinzugefügt.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'quantity'         => 'required|integer|min:0',
            'product_color_id' => 'nullable|exists:product_colors,id',
        ]);

        try {
            $cart = $this->cartService->updateItem(
                $request->user(),
                $request->product_id,
                $request->quantity,
                $request->product_color_id
            );

            $skontoData = $this->cartService->calculateSkontoDiscount(
                $request->user(),
                $cart->total
            );

            return response()->json([
                'data' => new CartResource($cart),
                'skonto' => $skontoData,
                'message' => 'Warenkorb aktualisiert.',
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function remove(Request $request): JsonResponse
    {
        $request->validate([
            'product_id'       => 'required|exists:products,id',
            'product_color_id' => 'nullable|exists:product_colors,id',
        ]);

        $cart = $this->cartService->removeItem(
            $request->user(),
            $request->product_id,
            $request->product_color_id
        );

        $skontoData = $this->cartService->calculateSkontoDiscount(
            $request->user(),
            $cart->total
        );

        return response()->json([
            'data' => new CartResource($cart),
            'skonto' => $skontoData,
            'message' => 'Produkt aus dem Warenkorb entfernt.',
        ]);
    }
}
