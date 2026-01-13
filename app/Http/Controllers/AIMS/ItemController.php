<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use App\Models\AIMS\Item;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    /**
     * Display a listing of items.
     */
    public function index()
    {
        return response()->json(
            Item::latest()->paginate(10)
        );
    }

    /**
     * Store a newly created item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            // Classification
            'item_type' => 'required|string|max:100',
            'status' => 'required|string|max:50',
            'location' => 'required|string|max:100',

            // Basic Info
            'name' => 'required|string|max:255',
            'sku' => 'required|string|max:100|unique:items,sku',
            'barcode' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'brand' => 'nullable|string|max:100',
            'unit' => 'required|string|max:50',

            // Supplier & Procurement
            'supplier_id' => 'nullable|integer',
            'lead_time' => 'nullable|integer|min:0',
            'preferred_purchase_qty' => 'nullable|integer|min:0',

            // Pricing
            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'tax_category' => 'required|string|max:50',
            'valuation_method' => 'required|string|max:50',

            // Stock Control
            'opening_stock' => 'required|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',

            // Notes
            'notes' => 'nullable|string',
        ]);

        // IMPORTANT BUSINESS LOGIC
        $validated['current_stock'] = $validated['opening_stock'];

        $item = Item::create($validated);

        return response()->json([
            'message' => 'Item created successfully',
            'data' => $item,
        ], 201);
    }

    /**
     * Display a specific item.
     */
    public function show(Item $item)
    {
        return response()->json($item);
    }

    /**
     * Update an item.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            'item_type' => 'required|string|max:100',
            'status' => 'required|string|max:50',
            'location' => 'required|string|max:100',

            'name' => 'required|string|max:255',
            'sku' => [
                'required',
                'string',
                Rule::unique('items', 'sku')->ignore($item->id),
            ],
            'barcode' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'brand' => 'nullable|string|max:100',
            'unit' => 'required|string|max:50',

            'supplier_id' => 'nullable|integer',
            'lead_time' => 'nullable|integer|min:0',
            'preferred_purchase_qty' => 'nullable|integer|min:0',

            'cost_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'tax_category' => 'required|string|max:50',
            'valuation_method' => 'required|string|max:50',

            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',

            'notes' => 'nullable|string',
        ]);

        $item->update($validated);

        return response()->json([
            'message' => 'Item updated successfully',
            'data' => $item,
        ]);
    }

    /**
     * Remove an item.
     */
    public function destroy(Item $item)
    {
        $item->delete();

        return response()->json([
            'message' => 'Item deleted successfully',
        ]);
    }
}
