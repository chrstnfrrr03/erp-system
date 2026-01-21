<?php

namespace App\Models\AIMS;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
    ];

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
