<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\SystemSetting;

class SettingsController extends Controller
{
    public function show()
    {
        $settings = SystemSetting::first();

        if (!$settings) {
            $settings = SystemSetting::create([]);
        }

        return response()->json([
            'companyName' => $settings->company_name,
            'companyAddress' => $settings->company_address,
            'email' => $settings->email,
            'phone' => $settings->phone,
            'country' => $settings->country,
            'timezone' => $settings->timezone,
            'currency' => $settings->currency,
            'dateFormat' => $settings->date_format,
        ]);
    }

    public function store(Request $request)
    {
        $settings = SystemSetting::firstOrCreate([]);

        $settings->update([
            'company_name' => $request->companyName,
            'company_address' => $request->companyAddress,
            'email' => $request->email,
            'phone' => $request->phone,
            'country' => $request->country,
            'timezone' => $request->timezone,
            'currency' => $request->currency,
            'date_format' => $request->dateFormat,
        ]);

        return response()->json(['success' => true]);
    }

    public function saveModules(Request $request)
    {
        return response()->json(['success' => true]);
    }
}
