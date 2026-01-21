<?php

namespace App\Models\AIMS;

use Illuminate\Database\Eloquent\Model;

class RequestOrderItem extends Model
{
    protected $fillable = [
        'request_order_id',
        'item_id',
        'quantity',
        'unit_cost',
        'subtotal',
    ];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
