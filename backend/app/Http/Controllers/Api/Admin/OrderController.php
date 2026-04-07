<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('user', 'items.product', 'items.color')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    public function update(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:eingegangen,bearbeitet,versendet,bezahlt,geschlossen',
        ]);

        try {
            $updated = $this->orderService->updateStatus($order, OrderStatus::from($request->status));
            return response()->json(['data' => new OrderResource($updated)]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function cancel(Order $order): JsonResponse
    {
        try {
            $updated = $this->orderService->cancelOrder($order);
            return response()->json(['data' => new OrderResource($updated)]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
