<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Employee List</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h2 { text-align: center; margin-bottom: 20px; color: #333; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th, td { border: 1px solid #333; padding: 8px; text-align: left; }
        th { background: #4a9eff; color: white; font-weight: bold; }
        tbody tr:nth-child(even) { background: #f9f9f9; }
        tbody tr:hover { background: #e3f2fd; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>

<h2>Employee List</h2>

<table>
    <thead>
        <tr>
            <th>Biometric ID</th>
            <th>Full Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Hire Date</th>
            <th>Employment Status</th>
        </tr>
    </thead>
    <tbody>
        @forelse ($employees as $emp)
        <tr>
            <td>{{ $emp->biometric_id ?? 'N/A' }}</td>
            <td>{{ $emp->fullname ?? 'N/A' }}</td>
            <td>{{ $emp->department ?? 'N/A' }}</td>
            <td>{{ $emp->position ?? 'N/A' }}</td>
            <td>{{ $emp->hireDate ?? 'N/A' }}</td>
            <td>{{ $emp->employment_classification ?? 'N/A' }}</td>
        </tr>
        @empty
        <tr>
            <td colspan="6" style="text-align: center; padding: 20px;">No employees found</td>
        </tr>
        @endforelse
    </tbody>
</table>

<div class="footer">
    Generated on {{ \Carbon\Carbon::now('Asia/Manila')->format('l, F d, Y - h:i A') }}
</div>

</body>
</html>
