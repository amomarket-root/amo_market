<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\WelcomeEmail;
use App\Models\AccountDeletion;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class PortalAuthenticateController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function handleGoogleCallback(): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->to('/?error=invalid_credentials');
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name'              => $socialUser->getName(),
                'email_verified_at' => now(),
                'password'          => null,
                'role_id'           => Role::where('name', 'Customer')->first()->id,
                'status'            => 1,
            ]
        );

        // Check if this is a new user (was just created)
        $isNewUser = $user->wasRecentlyCreated;

        // Update or create provider
        $user->providers()->updateOrCreate(
            [
                'provider'    => 'google',
                'provider_id' => $socialUser->getId(),
            ],
            ['avatar' => $socialUser->getAvatar()]
        );

        // Update login time
        $user->update(['login_time' => now()]);

        // Send welcome email if new user
        if ($isNewUser) {
            Mail::to($user->email)->queue(new WelcomeEmail($user, 'google')); // For Google
        }

        // Create token
        $token = $user->createToken('API TOKEN')->plainTextToken;

        return redirect()->to(
            env('FRONTEND_URL', 'http://localhost:8001').
                '/auth/callback?portal_token='.urlencode($token).
                '&user='.urlencode(json_encode([
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'role_id'         => $user->role_id,
                    'status'          => $user->status,
                    'is_authenticate' => true,
                ]))
        );
    }

    public function redirectToFacebook()
    {
        return Socialite::driver('facebook')
            ->stateless()
            ->redirect();
    }

    public function handleFacebookCallback(): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver('facebook')->stateless()->user();
        } catch (\Exception $e) {
            return redirect()->to('/?error=invalid_credentials');
        }

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name'              => $socialUser->getName(),
                'email_verified_at' => now(),
                'password'          => null,
                'role_id'           => Role::where('name', 'Customer')->first()->id,
                'status'            => 1,
            ]
        );

        // Check if this is a new user (was just created)
        $isNewUser = $user->wasRecentlyCreated;

        // Update or create provider
        $user->providers()->updateOrCreate(
            [
                'provider'    => 'facebook',
                'provider_id' => $socialUser->getId(),
            ],
            ['avatar' => $socialUser->getAvatar()]
        );

        // Update login time
        $user->update(['login_time' => now()]);

        // Send welcome email if new user
        if ($isNewUser) {
            Mail::to($user->email)->queue(new WelcomeEmail($user, 'facebook')); // For Facebook
        }

        // Create token
        $token = $user->createToken('API TOKEN')->plainTextToken;

        return redirect()->to(
            env('FRONTEND_URL', 'http://localhost:8001').
                '/auth/callback?portal_token='.urlencode($token).
                '&user='.urlencode(json_encode([
                    'id'              => $user->id,
                    'name'            => $user->name,
                    'email'           => $user->email,
                    'role_id'         => $user->role_id,
                    'status'          => $user->status,
                    'is_authenticate' => true,
                ]))
        );
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'reason'   => 'required|string',
            'feedback' => 'nullable|string',
        ]);

        $user = Auth::user(); // Get logged-in user

        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Store deletion request
        AccountDeletion::create([
            'user_name'           => $user->name   ?? null,
            'user_email'          => $user->email  ?? null,
            'user_contact_number' => $user->number ?? null,
            'reason'              => $request->reason,
            'feedback'            => $request->feedback,
        ]);

        $user->delete();

        return response()->json(['message' => 'Your account has been deleted successfully.'], 200);
    }

    public function authMobile(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name'   => 'required|string|unique:users,name',
                'number' => 'required|digits:10|unique:users,number',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $user = User::create([
                'name'     => $request->name,
                'number'   => $request->number,
                'password' => null,
                'role_id'  => Role::where('name', 'Customer')->first()->id,
                'status'   => 0,
            ]);

            $otp    = rand(100000, 999999);
            $apiKey = config('services.two_factor.api_key');
            $phone  = '91'.$request->number;
            $url    = config('services.two_factor.sms_url')."{$apiKey}/SMS/{$phone}/{$otp}/Amo+Market";

            $response = Http::get($url);
            $data     = $response->json();

            if (isset($data['Status']) && $data['Status'] === 'Success') {
                $user->update([
                    'otp'        => $otp,
                    'otp_expiry' => now()->addMinutes(5),
                ]);

                return response()->json([
                    'status'  => true,
                    'message' => 'OTP sent successfully via template',
                    'token'   => $user->createToken('API TOKEN')->plainTextToken,
                ], 200);
            } else {
                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to send OTP',
                    'error'   => $data,
                ], 500);
            }
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'otp'    => 'required|digits:6',
                'number' => 'required|digits:10',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $user = User::where('number', $request->number)->first();

            if (
                ! $user || ! $user->otp || ! $user->otp_expiry || now()->gt($user->otp_expiry) || $user->otp !== $request->otp
            ) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid or expired OTP',
                ], 401);
            }

            $user->update([
                'number_verified_at' => now(),
                'login_time'         => now(),
                'status'             => 1,
                'otp'                => null,
                'otp_expiry'         => null,
            ]);

            $token = $user->createToken('API TOKEN')->plainTextToken;

            return response()->json([
                'message'         => 'OTP verified successfully',
                'id'              => $user->id,
                'name'            => $user->name,
                'role_id'         => $user->role_id,
                'status'          => $user->status,
                'is_authenticate' => true,
                'portal_token'    => $token,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function resendOtp(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'number' => 'required|digits:10|exists:users,number',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $user = User::where('number', $request->number)->first();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                ], 404);
            }

            $otp    = rand(100000, 999999);
            $apiKey = config('services.two_factor.api_key');
            $phone  = '91'.$request->number;
            $url    = config('services.two_factor.sms_url')."{$apiKey}/SMS/{$phone}/{$otp}/Amo+Market";

            $response = Http::get($url);
            $data     = $response->json();

            if (isset($data['Status']) && $data['Status'] === 'Success') {
                $user->update([
                    'otp'        => $otp,
                    'otp_expiry' => now()->addMinutes(5),
                ]);

                return response()->json([
                    'status'  => true,
                    'message' => 'OTP resent successfully',
                    'token'   => $user->createToken('API TOKEN')->plainTextToken,
                    'otp'     => $otp, // For development/testing purposes
                ], 200);
            } else {
                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to resend OTP',
                    'error'   => $data,
                ], 500);
            }
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    public function getProfileAvatar()
    {
        try {
            // Get the authenticated user
            $user = Auth::user();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Unauthorized access.',
                    'data'    => [],
                ], 401);
            }

            // Load the avatar relation for the authenticated user
            $avatar = $user->avatar()->select('id', 'path')->first();

            // Check if the avatar exists
            if (! $avatar) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No Avatar found for the user.',
                    'data'    => [], // Return an empty array for consistency
                ], 404);
            }

            // Respond with the retrieved avatar details
            return response()->json([
                'status'  => true,
                'message' => 'Avatar retrieved successfully.',
                'data'    => $avatar,
            ], 200);
        } catch (\Exception $e) {
            // Handle exceptions and return a 500 error response
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while retrieving the avatar.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllRole()
    {
        try {
            // Retrieve all roles directly in the controller
            $roles = Role::orderBy('id', 'asc')->get();

            // Check if the roles list is empty
            if ($roles->isEmpty()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No roles found.',
                    'data'    => [], // Return an empty array for consistency
                ], 404);
            }

            // Respond with the retrieved roles
            return response()->json([
                'status'  => true,
                'message' => 'Roles retrieved successfully.',
                'data'    => $roles,
            ], 200);
        } catch (\Exception $e) {
            // Handle exceptions and return a 500 error response
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred while retrieving roles.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            // Get the authenticated user
            $user = $request->user();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No user logged in',
                ], 401);
            }

            // Update logout time
            $user->update([
                'logout_time' => Carbon::now(),
            ]);

            // Revoke the current token
            $request->user()->tokens()->delete();

            return response()->json([
                'status'  => true,
                'message' => 'Logged out successfully',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }
}
