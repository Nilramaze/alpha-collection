<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'product_color_id' => $this->product_color_id,
            'color_name' => $this->whenLoaded('color', fn() => $this->color?->name),
            'product' => new ProductResource($this->whenLoaded('product')),
            'quantity' => $this->quantity,
            'price_snapshot' => (float) $this->price_snapshot,
            'subtotal' => (float) $this->subtotal,
        ];
    }
}
