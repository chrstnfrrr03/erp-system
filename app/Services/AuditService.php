<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditService
{
    /**
     * Log an action
     */
    public static function log(
        string $action,
        $model = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $module = null
    ): AuditLog {
        $user = Auth::user();
        
        // Calculate changes
        $changes = null;
        if ($oldValues && $newValues) {
            $changes = self::calculateChanges($oldValues, $newValues);
        }

        return AuditLog::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'user_role' => $user?->role,
            'model_type' => $model ? get_class($model) : null,
            'model_id' => $model?->id,
            'action' => $action,
            'description' => $description ?? self::generateDescription($action, $model),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'changes' => $changes,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'module' => $module ?? self::detectModule($model),
        ]);
    }

    /**
     * Log model creation
     */
    public static function created($model, ?string $module = null): AuditLog
    {
        return self::log(
            'created',
            $model,
            null,
            null,
            $model->toArray(),
            $module
        );
    }

    /**
     * Log model update
     */
    public static function updated($model, array $oldValues, ?string $module = null): AuditLog
    {
        return self::log(
            'updated',
            $model,
            null,
            $oldValues,
            $model->toArray(),
            $module
        );
    }

    /**
     * Log model deletion
     */
    public static function deleted($model, ?string $module = null): AuditLog
    {
        return self::log(
            'deleted',
            $model,
            null,
            $model->toArray(),
            null,
            $module
        );
    }

    /**
     * Log custom action
     */
    public static function custom(
        string $action,
        string $description,
        $model = null,
        ?string $module = null,
        ?array $additionalData = null
    ): AuditLog {
        return self::log(
            $action,
            $model,
            $description,
            null,
            $additionalData,
            $module
        );
    }

    /**
     * Log login
     */
    public static function login(): AuditLog
    {
        return self::log(
            'login',
            Auth::user(),
            Auth::user()->name . ' logged in'
        );
    }

    /**
     * Log logout
     */
    public static function logout(): AuditLog
    {
        return self::log(
            'logout',
            Auth::user(),
            Auth::user()->name . ' logged out'
        );
    }

    /**
     * Log stock movement
     */
    public static function stockMovement(
        string $type,
        $item,
        int $quantity,
        ?string $reference = null
    ): AuditLog {
        $action = $type === 'IN' ? 'stock_in' : 'stock_out';
        
        return self::log(
            $action,
            $item,
            "Stock {$type}: {$quantity} units of {$item->name}" . 
            ($reference ? " (Ref: {$reference})" : ''),
            null,
            [
                'quantity' => $quantity,
                'type' => $type,
                'reference' => $reference,
            ],
            'AIMS'
        );
    }

    /**
     * Log approval
     */
    public static function approved($model, ?string $module = null): AuditLog
    {
        return self::log(
            'approved',
            $model,
            null,
            ['status' => 'pending'],
            ['status' => 'approved'],
            $module
        );
    }

    /**
     * Log rejection
     */
    public static function rejected($model, ?string $module = null): AuditLog
    {
        return self::log(
            'rejected',
            $model,
            null,
            ['status' => 'pending'],
            ['status' => 'rejected'],
            $module
        );
    }

    /**
     * Calculate changes between old and new values
     */
    private static function calculateChanges(array $old, array $new): array
    {
        $changes = [];
        
        foreach ($new as $key => $value) {
            if (!isset($old[$key]) || $old[$key] != $value) {
                $changes[$key] = [
                    'old' => $old[$key] ?? null,
                    'new' => $value,
                ];
            }
        }

        return $changes;
    }

    /**
     * Generate description based on action and model
     */
    private static function generateDescription(string $action, $model): string
    {
        if (!$model) {
            return ucfirst($action);
        }

        $modelName = class_basename($model);
        $identifier = $model->name ?? $model->id ?? '';

        return ucfirst($action) . " {$modelName}" . ($identifier ? ": {$identifier}" : '');
    }

    /**
     * Detect module from model namespace
     */
    private static function detectModule($model): ?string
    {
        if (!$model) {
            return null;
        }

        $namespace = get_class($model);

        if (str_contains($namespace, 'AIMS')) {
            return 'AIMS';
        }
        if (str_contains($namespace, 'HRMS')) {
            return 'HRMS';
        }
        if (str_contains($namespace, 'Payroll')) {
            return 'Payroll';
        }

        return null;
    }
}