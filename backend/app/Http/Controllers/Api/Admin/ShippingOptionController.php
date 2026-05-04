<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingOption;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingOptionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => ShippingOption::orderBy('sort_order')->orderBy('id')->get()->map(fn($s) => $this->fmt($s)),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'          => 'required|string|max:100',
            'price'         => 'required|numeric|min:0',
            'image'         => 'nullable|image|max:2048',
            'min_order_qty' => 'nullable|integer|min:0',
            'max_order_qty' => 'nullable|integer|min:0',
        ]);

        $maxOrder = ShippingOption::max('sort_order') ?? -1;

        $option = ShippingOption::create([
            'name'          => $request->input('name'),
            'price'         => $request->input('price', 0),
            'min_order_qty' => $request->input('min_order_qty', 0),
            'max_order_qty' => $request->filled('max_order_qty') ? $request->input('max_order_qty') : null,
            'active'        => true,
            'sort_order'    => $maxOrder + 1,
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('shipping', 'public');
            $option->update(['image_url' => '/storage/' . $path]);
        }

        return response()->json(['data' => $this->fmt($option->fresh())], 201);
    }

    public function update(Request $request, ShippingOption $shippingOption): JsonResponse
    {
        $request->validate([
            'name'          => 'sometimes|required|string|max:100',
            'price'         => 'sometimes|required|numeric|min:0',
            'image'         => 'nullable|image|max:2048',
            'min_order_qty' => 'nullable|integer|min:0',
            'max_order_qty' => 'nullable|integer|min:0',
        ]);

        $data = [];
        foreach (['name', 'price', 'min_order_qty'] as $field) {
            if ($request->has($field)) $data[$field] = $request->input($field);
        }
        if ($request->has('max_order_qty')) {
            $data['max_order_qty'] = $request->filled('max_order_qty') ? $request->input('max_order_qty') : null;
        }
        if ($request->has('active')) {
            $data['active'] = $request->boolean('active');
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('shipping', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $shippingOption->update($data);
        return response()->json(['data' => $this->fmt($shippingOption->fresh())]);
    }

    public function toggle(Request $request, ShippingOption $shippingOption): JsonResponse
    {
        $shippingOption->update(['active' => $request->boolean('active')]);
        return response()->json(['data' => $this->fmt($shippingOption->fresh())]);
    }

    public function destroy(ShippingOption $shippingOption): JsonResponse
    {
        $shippingOption->delete();
        return response()->json(['message' => 'Versandoption gelöscht.']);
    }

    private function fmt(ShippingOption $s): array
    {
        return [
            'id'            => $s->id,
            'name'          => $s->name,
            'price'         => (float) $s->price,
            'image_url'     => $s->image_url,
            'min_order_qty' => (int) $s->min_order_qty,
            'max_order_qty' => $s->max_order_qty !== null ? (int) $s->max_order_qty : null,
            'active'        => $s->active,
            'sort_order'    => $s->sort_order,
        ];
    }
}
