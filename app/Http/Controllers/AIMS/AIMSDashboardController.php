<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;

class AIMSDashboardController extends Controller
{
    public function index()
{
    $totalItems = Schema::hasTable('items')
        ? DB::table('items')->count()
        : 0;

    $lowStockItems = Schema::hasTable('items')
        ? DB::table('items')
            ->whereNotNull('current_stock')
            ->whereNotNull('minimum_stock')
            ->where('current_stock', '>', 0)
            ->whereColumn('current_stock', '<=', 'minimum_stock')
            ->count()
        : 0;

    $outOfStockItems = Schema::hasTable('items')
        ? DB::table('items')
            ->where('current_stock', 0)
            ->count()
        : 0;

    return response()->json([
        'total_items' => $totalItems,
        'low_stock_items' => $lowStockItems,
        'out_of_stock_items' => $outOfStockItems,  
    ]);
}

    public function stockDistribution()
    {
        if (!Schema::hasTable('items')) {
            return response()->json([]);
        }

        return response()->json([
            'in_stock' => DB::table('items')
                ->whereColumn('current_stock', '>', 'minimum_stock')
                ->count(),

            'low_stock' => DB::table('items')
                ->where('current_stock', '>', 0)
                ->whereColumn('current_stock', '<=', 'minimum_stock')
                ->count(),

            'out_of_stock' => DB::table('items')
                ->where('current_stock', 0)
                ->count(),

            'overstock' => Schema::hasColumn('items', 'maximum_stock')
                ? DB::table('items')
                    ->whereColumn('current_stock', '>', 'maximum_stock')
                    ->count()
                : 0,
        ]);
    }

    public function lowStockTrend()
    {
        if (!Schema::hasTable('items')) {
            return response()->json([]);
        }

        $days = collect(range(6, 0))->map(function ($i) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');

            return [
                'date' => $date,
                'count' => DB::table('items')
                    ->whereDate('updated_at', '<=', $date)
                    ->where('current_stock', '>', 0)
                    ->whereColumn('current_stock', '<=', 'minimum_stock')
                    ->count(),
            ];
        });

        return response()->json($days);
    }
}
