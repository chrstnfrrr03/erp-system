<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use App\Models\AIMS\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(
            Supplier::orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $supplier = Supplier::create($request->all());

        return response()->json($supplier, 201);
    }
}
