<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    protected $fillable = [
    'item_id',
    'name',
    'category',
    'location',
    'stock',
    'low_stock_threshold',
];

}
