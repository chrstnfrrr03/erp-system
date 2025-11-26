<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // GET all inventory items
    public function index()
    {
        return InventoryItem::all();
    }

    // POST create new item
    public function store(Request $request)
    {
        $validated = $request->validate([
            'item_id' => 'required|unique:inventory_items,item_id',
            'name' => 'required',
            'category' => 'required',
            'stock' => 'required|integer',
            'location' => 'nullable|string',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        return InventoryItem::create($validated);
    }

    // GET single item
    public function show($id)
    {
        return InventoryItem::findOrFail($id);
    }

    // PUT update item
    public function update(Request $request, $id)
    {
        $item = InventoryItem::findOrFail($id);

        $validated = $request->validate([
            'item_id' => 'sometimes|required|unique:inventory_items,item_id,' . $id,
            'name' => 'sometimes|required',
            'category' => 'sometimes|required',
            'stock' => 'sometimes|required|integer',
            'location' => 'nullable|string',
            'low_stock_threshold' => 'nullable|integer',
        ]);

        $item->update($validated);

        return $item;
    }

    // DELETE remove item
    public function destroy($id)
    {
        $item = InventoryItem::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Item deleted']);
    }
}
