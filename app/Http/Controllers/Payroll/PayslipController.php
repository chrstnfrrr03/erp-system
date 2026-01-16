<?php

namespace App\Http\Controllers\Payroll;

use App\Http\Controllers\Controller;
use App\Models\Payroll\Payslip;
use App\Models\Payroll\Payroll;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PayslipController extends Controller
{
    /**
     * HRMS – List payslips for an employee (by biometric_id)
     */
    public function index($biometric_id)
    {
        $payslips = Payslip::with(['employee.employmentInformation', 'payroll'])
            ->whereHas('employee', function ($query) use ($biometric_id) {
                $query->where('biometric_id', $biometric_id);
            })
            ->latest()
            ->get();

        return response()->json($payslips);
    }

    /**
     * HRMS – Show single payslip details
     */
   public function show($id)
{
    $payslip = Payslip::with([
        'employee.employmentInformation.department', 
        'payroll'
    ])->findOrFail($id);

    return response()->json($payslip);
}

    /**
     * Payroll – Generate payslip + PDF
     */
   public function generate($payrollId)
{
    try {
        $payroll = Payroll::with(['employee.employmentInformation.department'])->findOrFail($payrollId);

        // Prevent duplicate payslips
        $existingPayslip = Payslip::where('payroll_id', $payroll->id)->first();
        if ($existingPayslip) {
            Log::info('Payslip already exists', [
                'payslip_id' => $existingPayslip->id,
                'payroll_id' => $payroll->id
            ]);
            
            return response()->json([
                'message' => 'Payslip already exists',
                'payslip' => $existingPayslip
            ], 200);
        }

        $period = Carbon::parse($payroll->pay_period_start)->format('M d')
            . ' - ' .
            Carbon::parse($payroll->pay_period_end)->format('M d, Y');

        // Create payslip record
        $payslip = Payslip::create([
            'employee_id' => $payroll->employee_id,
            'payroll_id' => $payroll->id,
            'period' => $period,
            'net_pay' => $payroll->net_pay,
            'generated_at' => now(),
        ]);

        Log::info('Payslip record created', [
            'payslip_id' => $payslip->id,
            'employee_id' => $payroll->employee_id,
            'payroll_id' => $payroll->id
        ]);

        // Check if view exists
        $viewPath = resource_path('views/exports/payslip.blade.php');
        
        if (!view()->exists('exports.payslip')) {
            Log::error('Payslip view not found', [
                'view_name' => 'exports.payslip',
                'expected_path' => $viewPath,
                'file_exists' => file_exists($viewPath)
            ]);
            
            return response()->json([
                'message' => 'Payslip created but PDF generation failed - view not found',
                'payslip' => $payslip,
                'debug' => [
                    'expected_path' => $viewPath,
                    'file_exists' => file_exists($viewPath)
                ]
            ], 201);
        }

        Log::info('View exists, generating PDF', ['payslip_id' => $payslip->id]);

        // Generate PDF
        $pdf = Pdf::loadView('exports.payslip', [
            'payroll' => $payroll,
            'payslip' => $payslip,
        ]);

        // ✅ FIX: Use proper Windows path separators
        $filename = "{$payroll->employee->biometric_id}_{$payslip->id}.pdf";
        $relativePath = "payslips/{$filename}";
        
        // Ensure directory exists using proper paths
        $fullDirectory = storage_path('app/public/payslips');
        if (!file_exists($fullDirectory)) {
            mkdir($fullDirectory, 0755, true);
            Log::info('Created payslips directory');
        }
        
        // Save PDF directly to file system (not Storage facade)
        $fullPath = storage_path("app/public/payslips/{$filename}");
        file_put_contents($fullPath, $pdf->output());
        
        // Verify file was created
        $exists = file_exists($fullPath);
        
        Log::info('PDF save attempt completed', [
            'filename' => $filename,
            'full_path' => $fullPath,
            'file_exists' => $exists,
            'file_size' => $exists ? filesize($fullPath) : 0
        ]);

        if ($exists) {
            // Save PDF path to database
            $payslip->update(['pdf_path' => $relativePath]);
            
            Log::info('PDF generated successfully', [
                'payslip_id' => $payslip->id,
                'pdf_path' => $relativePath,
                'file_size' => filesize($fullPath)
            ]);
            
            return response()->json([
                'message' => 'Payslip generated successfully',
                'payslip' => $payslip->fresh()
            ], 201);
        } else {
            Log::error('PDF file was not created', [
                'full_path' => $fullPath,
                'directory_exists' => is_dir($fullDirectory),
                'directory_writable' => is_writable($fullDirectory)
            ]);
            
            return response()->json([
                'message' => 'Payslip created but PDF file was not saved',
                'payslip' => $payslip,
                'debug' => [
                    'full_path' => $fullPath,
                    'directory_exists' => is_dir($fullDirectory),
                    'directory_writable' => is_writable($fullDirectory)
                ]
            ], 201);
        }

    } catch (\Exception $e) {
        Log::error('Payslip generation failed', [
            'payroll_id' => $payrollId,
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'message' => 'Payslip generation failed',
            'error' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}

    /**
     * Download payslip PDF
     */
    public function download($id)
    {
        $payslip = Payslip::findOrFail($id);
        
        if (!$payslip->pdf_path) {
            return response()->json([
                'message' => 'PDF not available for this payslip'
            ], 404);
        }

        $fullPath = storage_path("app/public/{$payslip->pdf_path}");
        
        if (!file_exists($fullPath)) {
            Log::error('PDF file not found', [
                'payslip_id' => $id,
                'path' => $payslip->pdf_path,
                'full_path' => $fullPath
            ]);
            
            return response()->json([
                'message' => 'PDF file not found'
            ], 404);
        }

        return response()->download($fullPath);
    }
}