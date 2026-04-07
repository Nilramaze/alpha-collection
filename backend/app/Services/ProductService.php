<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductService
{
    public function getProducts(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with('categories', 'colors')->active();

        if (!empty($filters['category'])) {
            $query->whereHas('categories', function ($q) use ($filters) {
                $q->where('slug', $filters['category']);
            });
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $query->orderBy($sortBy, $sortDir);

        return $query->paginate($filters['per_page'] ?? 12);
    }

    public function getProduct(string $idOrSlug): Product
    {
        return Product::with('categories', 'colors')
            ->where('id', $idOrSlug)
            ->orWhere('slug', $idOrSlug)
            ->firstOrFail();
    }

    public function getFeatured(int $limit = 8): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with('categories', 'colors')
            ->active()
            ->inStock()
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }
}
