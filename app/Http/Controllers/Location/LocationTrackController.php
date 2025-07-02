<?php

namespace App\Http\Controllers\Location;

use App\Http\Controllers\Controller;
use App\Models\UserLocationHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationTrackController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude'   => 'required|numeric|between:-90,90',
            'longitude'  => 'required|numeric|between:-180,180',
            'ip_address' => 'nullable|string',
            'state'      => 'nullable|string|max:500',
            'city'       => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $locationData = [
                'ip_address' => $request->ip_address ?? $request->ip(),
                'latitude'   => $request->latitude,
                'longitude'  => $request->longitude,
                'state'      => $request->state ?? null,
                'city'       => $request->city  ?? null,
            ];

            // Use createOrUpdate to prevent duplicates
            UserLocationHistory::create($locationData);

            return response()->json([
                'success' => true,
                'message' => 'Location stored successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to store location',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
