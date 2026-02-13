<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    /**
     * Get all users (system admin only)
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'is_active', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Update user (name, email, role, status) - system admin only
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        // Store old values for audit
        $oldData = [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => $user->is_active,
        ];

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'role' => ['required', Rule::in(['system_admin', 'hr', 'dept_head', 'employee'])],
            'is_active' => 'required|boolean',
        ]);

        // Update user
        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];
        $user->is_active = $validated['is_active'];
        $user->save();

        // Build audit description
        $changes = [];
        if ($oldData['name'] !== $user->name) {
            $changes[] = "name from '{$oldData['name']}' to '{$user->name}'";
        }
        if ($oldData['email'] !== $user->email) {
            $changes[] = "email from '{$oldData['email']}' to '{$user->email}'";
        }
        if ($oldData['role'] !== $user->role) {
            $changes[] = "role from '{$oldData['role']}' to '{$user->role}'";
        }
        if ($oldData['is_active'] !== $user->is_active) {
            $status = $user->is_active ? 'activated' : 'deactivated';
            $changes[] = "status to {$status}";
        }

        // Calculate changes in audit format
        $auditChanges = [];
        foreach ($changes as $change) {
            // Parse the change string to extract field and values
            if (preg_match('/(.+?) from \'(.+?)\' to \'(.+?)\'/', $change, $matches)) {
                $field = $matches[1];
                $auditChanges[$field] = ['old' => $matches[2], 'new' => $matches[3]];
            }
        }

        // Log to audit trail (using 'updated' enum value)
        if (!empty($changes)) {
            AuditLog::create([
                'user_id' => $currentUser->id,
                'user_name' => $currentUser->name,
                'user_role' => $currentUser->role,
                'model_type' => 'App\\Models\\User',
                'model_id' => $user->id,
                'action' => 'updated', 
                'description' => 'Updated user ' . $user->name . ': ' . implode(', ', $changes),
                'old_values' => $oldData,
                'new_values' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                ],
                'changes' => $auditChanges,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'module' => 'Settings',
            ]);
        }

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Reset user password (system admin only)
     */
    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();

        $validated = $request->validate([
            'new_password' => 'required|string|min:8',
        ]);

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        // Log to audit trail (using 'other' enum value for password reset)
        AuditLog::create([
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'user_role' => $currentUser->role,
            'model_type' => 'App\\Models\\User',
            'model_id' => $user->id,
            'action' => 'other', 
            'description' => "Reset password for user: {$user->name} ({$user->email})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'module' => 'Settings',
        ]);

        return response()->json([
            'message' => 'Password reset successfully',
        ]);
    }

    /**
     * Delete user (system admin only)
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentUser = $request->user();
        
        // Prevent deleting yourself
        if ($user->id == $currentUser->id) {
            return response()->json([
                'message' => 'You cannot delete your own account',
            ], 403);
        }

        // Store user info before deletion
        $userName = $user->name;
        $userEmail = $user->email;
        $userRole = $user->role;

        // Delete user
        $user->delete();

        AuditLog::create([
            'user_id' => $currentUser->id,
            'user_name' => $currentUser->name,
            'user_role' => $currentUser->role,
            'model_type' => 'App\\Models\\User',
            'model_id' => $id,
            'action' => 'deleted', 
            'description' => "Deleted user: {$userName} ({$userEmail}) with role '{$userRole}'",
            'old_values' => [
                'name' => $userName,
                'email' => $userEmail,
                'role' => $userRole,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'module' => 'Settings',
        ]);

        return response()->json([
            'message' => 'User deleted successfully',
        ]);
    }
}