<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\JsonResponse;

class CertificateController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Certificate::orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }
}
