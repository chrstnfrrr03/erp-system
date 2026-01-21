<?php

namespace App\Models\AIMS;

use Illuminate\Database\Eloquent\Model;

class RequestOrder extends Model
{
    protected $fillable = [
        'po_number',
        'supplier_id',
        'order_date',
        'status',
        'total_amount',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(RequestOrderItem::class);
    }
}
