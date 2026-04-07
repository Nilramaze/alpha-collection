<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Services\ProductService;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        private ProductService $productService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $products = $this->productService->getProducts($request->all());

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }

    public function show(Request $request, string $idOrSlug): JsonResponse
    {
        $product = $this->productService->getProduct($idOrSlug);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function featured(): JsonResponse
    {
        $products = $this->productService->getFeatured();

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::withCount('products')->orderBy('name')->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }
}
