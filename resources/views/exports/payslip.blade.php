<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Payslip - {{ $payroll->employee->first_name }} {{ $payroll->employee->last_name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .payslip-title {
            font-size: 18px;
            color: #666;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
        }
        .net-pay {
            font-size: 16px;
            font-weight: bold;
            color: #28a745;
        }
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .text-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">NEXTGEN TECHNOLOGY LIMITED</div>
        <div class="payslip-title">EMPLOYEE PAYSLIP</div>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Employee Name:</span>
            <span>{{ $payroll->employee->first_name }} {{ $payroll->employee->last_name }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Employee ID:</span>
            <span>{{ $payroll->employee->biometric_id }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Department:</span>
            <span>{{ $payroll->employee->employmentInformation->department->name ?? 'N/A' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Position:</span>
            <span>{{ $payroll->employee->employmentInformation->position ?? 'N/A' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Pay Period:</span>
            <span>{{ \Carbon\Carbon::parse($payroll->pay_period_start)->format('M d, Y') }} - {{ \Carbon\Carbon::parse($payroll->pay_period_end)->format('M d, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Date:</span>
            <span>{{ \Carbon\Carbon::parse($payroll->payment_date)->format('M d, Y') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Pay Type:</span>
            <span>{{ $payroll->pay_type }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Earnings</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Base Salary ({{ $payroll->employee->employmentInformation->rate_type ?? 'N/A' }})</td>
                <td class="text-right">{{ number_format($payroll->base_salary, 2) }}</td>
            </tr>
            <tr>
                <td>Regular Hours ({{ number_format($payroll->total_hours, 2) }} hrs @ {{ $payroll->days_worked }} days)</td>
                <td class="text-right">{{ number_format($payroll->gross_pay - $payroll->overtime_pay, 2) }}</td>
            </tr>
            @if($payroll->overtime_hours > 0)
            <tr>
                <td>Overtime Pay ({{ number_format($payroll->overtime_hours, 2) }} hrs @ 1.5x)</td>
                <td class="text-right">{{ number_format($payroll->overtime_pay, 2) }}</td>
            </tr>
            @endif
            @if($payroll->bonuses > 0)
            <tr>
                <td>Bonuses</td>
                <td class="text-right">{{ number_format($payroll->bonuses, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>GROSS PAY</td>
                <td class="text-right">{{ number_format($payroll->gross_pay, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <table>
        <thead>
            <tr>
                <th>Deductions</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Tax (10%)</td>
                <td class="text-right">-{{ number_format($payroll->tax, 2) }}</td>
            </tr>
            @if($payroll->nasfund > 0)
            <tr>
                <td>NASFUND (6%)</td>
                <td class="text-right">-{{ number_format($payroll->nasfund, 2) }}</td>
            </tr>
            @endif
            @if($payroll->other_deductions > 0)
            <tr>
                <td>Other Deductions (Late penalties, etc.)</td>
                <td class="text-right">-{{ number_format($payroll->other_deductions, 2) }}</td>
            </tr>
            @endif
            <tr class="total-row">
                <td>TOTAL DEDUCTIONS</td>
                <td class="text-right">-{{ number_format($payroll->deductions, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <table>
        <tbody>
            <tr class="total-row">
                <td>NET PAY</td>
                <td class="text-right net-pay">{{ number_format($payroll->net_pay, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="info-section" style="margin-top: 30px;">
        <h4 style="margin-bottom: 15px;">Attendance Summary</h4>
        <div class="info-row">
            <span class="info-label">Days Worked:</span>
            <span>{{ $payroll->days_worked }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Days Absent:</span>
            <span>{{ $payroll->days_absent }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Days Late:</span>
            <span>{{ $payroll->days_late }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Regular Hours:</span>
            <span>{{ number_format($payroll->total_hours, 2) }} hrs</span>
        </div>
        <div class="info-row">
            <span class="info-label">Overtime Hours:</span>
            <span>{{ number_format($payroll->overtime_hours, 2) }} hrs</span>
        </div>
    </div>

    <div class="footer">
        <p>This is a computer-generated payslip. No signature is required.</p>
        <p>Generated on {{ now()->format('F d, Y h:i A') }}</p>
    </div>
</body>
</html>