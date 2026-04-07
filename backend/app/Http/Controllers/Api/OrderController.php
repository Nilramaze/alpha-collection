<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
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
        $orders = $this->orderService->getUserOrders($request->user());

        return response()->json(
            OrderResource::collection($orders)->response()->getData(true)
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = $request->user()->orders()
            ->with('items.product')
            ->findOrFail($id);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $order = $this->orderService->createOrder(
                $request->user(),
                $request->notes
            );

            return response()->json([
                'data' => new OrderResource($order),
                'message' => 'Bestellung erfolgreich aufgegeben.',
            ], 201);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }
}
