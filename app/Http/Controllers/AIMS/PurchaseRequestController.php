<?php

namespace App\Http\Controllers\AIMS;

use App\Http\Controllers\Controller;
use App\Models\AIMS\PurchaseRequest;
use App\Models\AIMS\PurchaseRequestItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class PurchaseRequestController extends Controller
{
    /**
     * Get latest PR number (for auto-generate in React)
     * Example: PR-2026-0001
     */
    public function latest()
    {
        $last = PurchaseRequest::latest('id')->first();

        return response()->json([
            'last_number' => $last
                ? intval(substr($last->pr_number, -4))
                : 0
        ]);
    }

    /**
     * List all Purchase Requests
     */
    public function index()
    {
        return PurchaseRequest::with([
                'items.item',
                'requester',
                'approver',
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Show single Purchase Request (VIEW PAGE)
     */
    public function show($id)
    {
        return PurchaseRequest::with([
                'items.item',
                'requester',
                'approver',
            ])
            ->findOrFail($id);
    }

    /**
     * Store new Purchase Request
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pr_number'            => 'required|string|unique:purchase_requests,pr_number',
            'request_date'         => 'required|date',
            'notes'                => 'nullable|string',
            'items'                => 'required|array|min:1',
            'items.*.item_id'      => 'required|exists:items,id',
            'items.*.quantity'     => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {

            $pr = PurchaseRequest::create([
                'pr_number'    => $validated['pr_number'],
                'request_date' => $validated['request_date'],
                'notes'        => $validated['notes'] ?? null,
                'status'       => 'Pending',
                'requested_by' => Auth::id(),
            ]);

            foreach ($validated['items'] as $item) {
                PurchaseRequestItem::create([
                    'purchase_request_id' => $pr->id,
                    'item_id'             => $item['item_id'],
                    'quantity'            => $item['quantity'],
                ]);
            }
        });

        return response()->json([
            'message' => 'Purchase Request created successfully',
        ], 201);
    }

    /**
     * Approve Purchase Request
     */
    public function approve($id)
    {
        $pr = PurchaseRequest::findOrFail($id);

        if ($pr->status !== 'Pending') {
            return response()->json([
                'message' => 'Only pending requests can be approved'
            ], 422);
        }

        $pr->update([
            'status'      => 'Approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        return response()->json([
            'message' => 'Purchase Request approved',
        ]);
    }

    /**
     * Reject Purchase Request
     */
    public function reject($id)
    {
        $pr = PurchaseRequest::findOrFail($id);

        if ($pr->status !== 'Pending') {
            return response()->json([
                'message' => 'Only pending requests can be rejected'
            ], 422);
        }

        $pr->update([
            'status' => 'Rejected',
        ]);

        return response()->json([
            'message' => 'Purchase Request rejected',
        ]);
    }
}
