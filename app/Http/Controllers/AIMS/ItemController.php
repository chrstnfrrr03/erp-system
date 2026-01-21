<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use App\Models\AIMS\Item;
use App\Models\AIMS\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ItemController extends Controller
{
    /**
     * Display a listing of items.
     */
    public function index()
    {
        $items = Item::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
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
            'valuation_method' => 'required|string|max:50',

            // Stock Control
            'opening_stock' => 'required|integer|min:0',
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',

            // Notes
            'notes' => 'nullable|string',
        ]);

        // IMPORTANT:
        // current_stock must start at ZERO
        // stock movements will control the real stock
        $validated['current_stock'] = 0;
        $validated['minimum_stock'] = $validated['minimum_stock'] ?? 0;
        $validated['maximum_stock'] = $validated['maximum_stock'] ?? 0;
        $validated['reorder_quantity'] = $validated['reorder_quantity'] ?? 0;

        $openingStock = $validated['opening_stock'];
        unset($validated['opening_stock']);

        $item = Item::create($validated);

        // ✅ AUTO STOCK MOVEMENT (Opening Stock)
        if ($openingStock > 0) {
            StockMovement::create([
                'item_id'   => $item->id,
                'type'      => 'IN',
                'quantity'  => $openingStock,
                'reference' => 'Opening Stock',
                'notes'     => 'Initial inventory entry',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Item created successfully',
            'data' => $item->fresh(),
        ], 201);
    }

    /**
     * Display a specific item.
     */
    public function show(Item $item)
    {
        return response()->json([
            'success' => true,
            'data' => $item,
        ]);
    }

    /**
     * Update an item.
     */
    public function update(Request $request, Item $item)
    {
        $validated = $request->validate([
            // Classification
            'item_type' => 'required|string|max:100',
            'status' => 'required|string|max:50',
            'location' => 'required|string|max:100',

            // Basic Info
            'name' => 'required|string|max:255',
            'sku' => [
                'required',
                'string',
                'max:100',
                Rule::unique('items', 'sku')->ignore($item->id),
            ],
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
            'valuation_method' => 'required|string|max:50',

            // Stock Control
            'minimum_stock' => 'nullable|integer|min:0',
            'maximum_stock' => 'nullable|integer|min:0',
            'reorder_quantity' => 'nullable|integer|min:0',

            // Notes
            'notes' => 'nullable|string',
        ]);

        $validated['minimum_stock'] = $validated['minimum_stock'] ?? 0;
        $validated['maximum_stock'] = $validated['maximum_stock'] ?? 0;
        $validated['reorder_quantity'] = $validated['reorder_quantity'] ?? 0;

        $item->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Item updated successfully',
            'data' => $item->fresh(),
        ]);
    }

    /**
     * Remove an item.
     */
    public function destroy(Item $item)
    {
        if ($item->current_stock > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete item with existing stock. Current stock: ' . $item->current_stock,
            ], 422);
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item deleted successfully',
        ]);
    }

    /**
     * Get low stock items.
     */
    public function lowStock()
    {
        $items = Item::whereColumn('current_stock', '<=', 'minimum_stock')
            ->where('current_stock', '>', 0)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }

    /**
     * Get out of stock items.
     */
    public function outOfStock()
    {
        $items = Item::where('current_stock', 0)->get();

        return response()->json([
            'success' => true,
            'data' => $items,
            'count' => $items->count(),
        ]);
    }
}
