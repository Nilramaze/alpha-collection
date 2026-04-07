<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'total_price' => (float) $this->total_price,
            'skonto_discount' => (float) $this->skonto_discount,
            'final_price' => (float) $this->final_price,
            'notes' => $this->notes,
            'user' => $this->whenLoaded('user', fn() => [
                'id'                       => $this->user->id,
                'name'                     => $this->user->name,
                'email'                    => $this->user->email,
                'delivery_company'         => $this->user->delivery_company,
                'delivery_street'          => $this->user->delivery_street,
                'delivery_zip'             => $this->user->delivery_zip,
                'delivery_city'            => $this->user->delivery_city,
                'delivery_country'         => $this->user->delivery_country,
                'billing_same_as_delivery' => (bool) ($this->user->billing_same_as_delivery ?? true),
                'billing_company'          => $this->user->billing_company,
                'billing_street'           => $this->user->billing_street,
                'billing_zip'              => $this->user->billing_zip,
                'billing_city'             => $this->user->billing_city,
                'billing_country'          => $this->user->billing_country,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
