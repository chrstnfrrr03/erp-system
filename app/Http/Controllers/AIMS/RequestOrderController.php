<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use App\Models\AIMS\RequestOrder;
use App\Models\AIMS\RequestOrderItem;
use App\Models\AIMS\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequestOrderController extends Controller
{
    /* ===============================
       LIST REQUEST ORDERS
    =============================== */
    public function index()
    {
        return response()->json([
            'data' => RequestOrder::with('supplier')
                ->orderBy('created_at', 'desc')
                ->get()
        ]);
    }

    /* ===============================
       CREATE REQUEST ORDER
    =============================== */
    public function store(Request $request)
    {
        $request->validate([
            'po_number'   => 'required|string|unique:request_orders,po_number',
            'supplier_id'=> 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'items'      => 'required|array|min:1',
            'items.*.item_id'    => 'required|exists:items,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {

            $totalAmount = collect($request->items)->sum(
                fn ($row) => $row['quantity'] * $row['unit_price']
            );

            $order = RequestOrder::create([
                'po_number'    => $request->po_number,
                'supplier_id'  => $request->supplier_id,
                'order_date'   => $request->order_date,
                'total_amount'=> $totalAmount,
            ]);

            foreach ($request->items as $row) {
                RequestOrderItem::create([
                    'request_order_id' => $order->id,
                    'item_id'          => $row['item_id'],
                    'quantity'         => $row['quantity'],
                    'unit_cost'        => $row['unit_price'],
                    'subtotal'         => $row['quantity'] * $row['unit_price'],
                ]);
            }
        });

        return response()->json(['message' => 'Request order created']);
    }

    /* ===============================
       APPROVE ORDER (AUTO STOCK-IN)
    =============================== */
    public function approve($id)
    {
        $order = RequestOrder::with('items.item')
            ->lockForUpdate()
            ->findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Already processed'], 400);
        }

        DB::transaction(function () use ($order) {
            foreach ($order->items as $row) {
                StockMovement::create([
                    'item_id'   => $row->item_id,
                    'type'      => 'IN',
                    'quantity'  => $row->quantity,
                    'reference' => $order->po_number,
                    'notes'     => 'Request Order Approved',
                ]);
            }

            $order->update(['status' => 'approved']);
        });

        return response()->json(['message' => 'Request order approved']);
    }

    /* ===============================
       SHOW ORDER
    =============================== */
    public function show($id)
{
    $order = RequestOrder::with([
        'supplier',
        'items.item'
    ])->findOrFail($id);

    return response()->json([
        'data' => $order
    ]);
}

    /* ===============================
       UPDATE ORDER (PENDING ONLY)
    =============================== */
    public function update(Request $request, $id)
    {
        $order = RequestOrder::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Cannot edit approved order'], 400);
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date'  => 'required|date',
        ]);

        $order->update($request->only([
            'supplier_id',
            'order_date'
        ]));

        return response()->json(['message' => 'Order updated']);
    }

    /* ===============================
       CANCEL ORDER
    =============================== */
    public function cancel($id)
    {
        $order = RequestOrder::findOrFail($id);

        if ($order->status !== 'pending') {
            return response()->json(['message' => 'Already processed'], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Order cancelled']);
    }
}
