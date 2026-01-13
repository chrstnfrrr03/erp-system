<?php 
namespace App\Models\AIMS;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'item_type',
        'status',
        'location',
        'name',
        'sku',
        'barcode',
        'category',
        'brand',
        'unit',
        'supplier_id',
        'lead_time',
        'preferred_purchase_qty',
        'cost_price',
        'selling_price',
        'tax_category',
        'valuation_method',
        'opening_stock',
        'current_stock',
        'minimum_stock',
        'maximum_stock',
        'reorder_quantity',
        'notes',
    ];
}
