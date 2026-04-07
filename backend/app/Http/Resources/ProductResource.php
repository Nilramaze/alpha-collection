<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $isAuthenticated = auth()->guard('sanctum')->check();

        $greenMin = (int) \App\Models\Setting::get('stock_green_min', 100);
        $yellowMin = (int) \App\Models\Setting::get('stock_yellow_min', 1);

        // Gesamtbestand aus Farben berechnen (oder Produktfeld als Fallback)
        $totalStock = $this->relationLoaded('colors') && $this->colors->isNotEmpty()
            ? $this->colors->sum('stock_quantity')
            : ($this->stock_quantity ?? 0);

        $stockStatus = $totalStock >= $greenMin ? 'green' : ($totalStock >= $yellowMin ? 'yellow' : 'red');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'model_number' => $this->model_number,
            'size' => $this->size,
            'height' => $this->height,
            'description' => $this->description,
            'image_url' => $this->image_url,
            'colors' => $this->whenLoaded('colors', fn() => $this->colors->map(fn($color) => [
                'id' => $color->id,
                'name' => $color->name,
                'image_url' => $color->image_url,
                'stock_quantity' => $isAuthenticated ? $color->stock_quantity : null,
            ])),
            'categories' => CategoryResource::collection($this->whenLoaded('categories')),
            'price' => $isAuthenticated ? (float) $this->price : null,
            'stock_quantity' => $isAuthenticated ? $totalStock : null,
            'stock_status' => $isAuthenticated ? $stockStatus : null,
            'in_stock' => $isAuthenticated ? $totalStock > 0 : null,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
