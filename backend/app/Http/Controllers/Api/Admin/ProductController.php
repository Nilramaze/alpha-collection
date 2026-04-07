<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductColor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with('categories', 'colors')
            ->when($request->search, fn($q) => $q->where('name', 'LIKE', "%{$request->search}%")
                ->orWhere('sku', 'LIKE', "%{$request->search}%"))
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json(
            ProductResource::collection($products)->response()->getData(true)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:255',
            'sku'                     => 'nullable|string|unique:products,sku',
            'model_number'            => 'nullable|string|max:100',
            'size'                    => 'nullable|string|max:50',
            'height'                  => 'nullable|integer|min:0',
            'description'             => 'nullable|string',
            'price'                   => 'required|numeric|min:0',
            'is_active'               => 'boolean',
            'category_ids'            => 'nullable|array',
            'category_ids.*'          => 'exists:categories,id',
            'colors'                  => 'nullable|array',
            'colors.*.name'           => 'required|string|max:100',
            'colors.*.stock_quantity' => 'required|integer|min:0',
            'image'                   => 'nullable|image|max:5120',
            'color_images.*'          => 'nullable|image|max:5120',
        ]);

        $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        $categoryIds = $data['category_ids'] ?? [];
        $colors      = $data['colors'] ?? [];
        unset($data['category_ids'], $data['colors']);

        $product = Product::create($data);
        if ($categoryIds) $product->categories()->sync($categoryIds);

        foreach ($colors as $i => $colorData) {
            $colorImageFile = $request->file("color_images.{$i}");
            if ($colorImageFile) {
                $colorPath = $colorImageFile->store('products/colors', 'public');
                $colorData['image_url'] = '/storage/' . $colorPath;
            }
            $product->colors()->create($colorData);
        }

        return response()->json(['data' => new ProductResource($product->load('categories', 'colors'))], 201);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name'                    => 'sometimes|string|max:255',
            'sku'                     => 'sometimes|nullable|string|unique:products,sku,' . $product->id,
            'model_number'            => 'nullable|string|max:100',
            'size'                    => 'nullable|string|max:50',
            'height'                  => 'nullable|integer|min:0',
            'description'             => 'nullable|string',
            'price'                   => 'sometimes|numeric|min:0',
            'is_active'               => 'sometimes|boolean',
            'category_ids'            => 'nullable|array',
            'category_ids.*'          => 'exists:categories,id',
            'colors'                  => 'nullable|array',
            'colors.*.name'           => 'required|string|max:100',
            'colors.*.stock_quantity' => 'required|integer|min:0',
            'colors.*.keep_image'     => 'nullable|string', // existing image_url to keep
            'image'                   => 'nullable|image|max:5120',
            'color_images.*'          => 'nullable|image|max:5120',
        ]);

        if (isset($data['name'])) $data['slug'] = Str::slug($data['name']);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $data['image_url'] = '/storage/' . $path;
        }

        if (array_key_exists('category_ids', $data)) {
            $product->categories()->sync($data['category_ids'] ?? []);
            unset($data['category_ids']);
        }

        if (array_key_exists('colors', $data)) {
            $product->colors()->delete();
            foreach ($data['colors'] as $i => $colorData) {
                $colorImageFile = $request->file("color_images.{$i}");
                if ($colorImageFile) {
                    $colorPath = $colorImageFile->store('products/colors', 'public');
                    $colorData['image_url'] = '/storage/' . $colorPath;
                } elseif (!empty($colorData['keep_image'])) {
                    $colorData['image_url'] = $colorData['keep_image'];
                }
                unset($colorData['keep_image']);
                $product->colors()->create($colorData);
            }
            unset($data['colors']);
        }

        $product->update($data);

        return response()->json(['data' => new ProductResource($product->fresh('categories', 'colors'))]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Produkt gelöscht.']);
    }
}
