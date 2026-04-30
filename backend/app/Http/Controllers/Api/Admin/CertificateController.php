<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Certificate::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:200',
            'file' => 'required|file|mimes:pdf|max:20480',
        ]);

        $path = $request->file('file')->store('certificates', 'public');
        $maxOrder = Certificate::max('sort_order') ?? -1;

        $cert = Certificate::create([
            'name'       => $request->input('name'),
            'file_url'   => '/storage/' . $path,
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['data' => $cert], 201);
    }

    public function update(Request $request, Certificate $certificate): JsonResponse
    {
        $request->validate(['name' => 'required|string|max:200']);
        $certificate->update(['name' => $request->input('name')]);
        return response()->json(['data' => $certificate]);
    }

    public function destroy(Certificate $certificate): JsonResponse
    {
        $certificate->delete();
        return response()->json(['message' => 'Zertifikat gelöscht.']);
    }
}
