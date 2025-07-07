<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AccountDeletion;
use Illuminate\Http\RedirectResponse;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Laravel\Socialite\Facades\Socialite;

class PortalAuthenticateController extends Controller
{
    public function redirectToProvider()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function handleProviderCallback(): RedirectResponse
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
                'name' => $socialUser->getName(),
                'email_verified_at' => now(),
                'password' => null,
                'role_id' => Role::where('name', 'Customer')->first()->id,
                'status' => 1,
            ]
        );

        // Update or create provider
        $user->providers()->updateOrCreate(
            [
                'provider' => 'google',
                'provider_id' => $socialUser->getId(),
            ],
            ['avatar' => $socialUser->getAvatar()]
        );

        // Update login time
        $user->update(['login_time' => now()]);

        // Create token using your existing naming convention
        $token = $user->createToken('API TOKEN')->plainTextToken;

        return redirect()->to(
            env('FRONTEND_URL', 'http://localhost:8001') .
                '/auth/callback?portal_token=' . urlencode($token) .
                '&user=' . urlencode(json_encode([
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role_id' => $user->role_id,
                    'status' => $user->status,
                    'is_authenticate' => true
                ]))
        );
    }

    public function facebookLogin()
    {
        return Socialite::driver('facebook')->stateless()->redirect();
    }


    public function facebookHandle()
    {
        try {
            $facebookUser = Socialite::driver('facebook')->stateless()->user();

            $user = User::firstOrCreate(
                ['social_media_id' => $facebookUser->id],
                [
                    'email'      => $facebookUser->email,
                    'name'       => $facebookUser->name,
                    'avatar'     => $facebookUser->avatar,
                    'login_time' => Carbon::now(),
                    'status'     => '1',
                ]
            );

            $token = $user->createToken('API TOKEN')->plainTextToken;

            return redirect('http://localhost:3000/dashboard?token=' . $token);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
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

    public function sendOtpWhatsApp($phoneNumber, $otp)
    {
        try {
            // Get Twilio credentials from .env
            $sid    = env('TWILIO_SID');                      // Your Twilio Account SID
            $token  = env('TWILIO_AUTH_TOKEN');              // Your Twilio Auth Token
            $twilio = new Client($sid, $token);             // Twilio Client Initialization

            // Prepare the message body
            $messageBody = "Your one-time OTP is $otp. Do not share it with anyone.";

            // Format phone number (add 'whatsapp:' prefix)
            $formattedPhoneNumber = 'whatsapp:' . $phoneNumber;

            // Send WhatsApp message
            $message = $twilio->messages->create(
                $formattedPhoneNumber,                // WhatsApp recipient (with international code)
                [
                    'from' => 'whatsapp:' . env('TWILIO_WHATSAPP_NUMBER'), // Twilio WhatsApp number
                    'body' => $messageBody,                 // OTP message content
                ]
            );

            // Return success response
            return [
                'status'          => true,
                'message'         => 'WhatsApp OTP sent successfully!',
                'twilio_response' => $message,
            ];
        } catch (RestException $e) {
            // Handle Twilio-specific errors
            return [
                'status'  => false,
                'message' => 'Failed to send WhatsApp OTP',
                'error'   => $e->getMessage(),
            ];
        } catch (\Exception $e) {
            // Handle general errors
            return [
                'status'  => false,
                'message' => 'An unexpected error occurred while sending the OTP',
                'error'   => $e->getMessage(),
            ];
        }
    }

    public function authMobile(Request $request)
    {
        try {
            // Validation rules including confirmation for password
            $validateUser = Validator::make($request->all(), [
                'name'   => 'required|unique:users,name',
                'number' => 'required|unique:users,number',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $user = User::create([
                'name'   => $request->name,
                'number' => $request->number,
                'password' => null,
                'role_id' => Role::where('name', 'Customer')->first()->id,
                'status' => '0',
            ]);

            // Generate a new OTP
            $otp = rand(100000, 999999);

            // Save the OTP to the database
            $user->update([
                'otp'        => $otp,
                'otp_expiry' => Carbon::now()->addMinutes(5),
            ]);

            // Default success response for local environment
            if (app()->environment('local')) {
                return response()->json([
                    'status'  => true,
                    'message' => 'OTP generated (local environment)',
                    'otp'     => $otp,
                    'token'   => $user->createToken('API TOKEN')->plainTextToken,
                ], 200);
            }

            // For other environments, send OTP via WhatsApp
            $phoneNumber = '+917381883483'; // or $request->number if dynamic
            $response    = $this->sendOtpWhatsApp($phoneNumber, $otp);

            if ($response['status'] === true) {
                return response()->json([
                    'status'  => true,
                    'message' => 'OTP sent successfully',
                    'otp'     => $otp,
                    'token'   => $user->createToken('API TOKEN')->plainTextToken,
                ], 200);
            } else {
                return response()->json([
                    'status'  => false,
                    'message' => 'Failed to send OTP SMS, Try different Login Method',
                    'error'   => $response['message'],
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
            // Validation rules for OTP
            $validateUser = Validator::make($request->all(), [
                'otp' => 'required|digits:6',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $user = User::where('otp', $request->otp)
                ->where('otp_expiry', '>=', Carbon::now())
                ->first();

            if ($user) {
                $user->update([
                    'number_verified_at' => Carbon::now(),
                    'login_time'         => Carbon::now(),
                    'status'             => '1',
                    'otp'                => null,
                    'otp_expiry'         => null,
                ]);

                // Generate the API token
                $authToken = $user->createToken('API TOKEN')->plainTextToken;

                return response()->json([
                    'status'       => true,
                    'message'      => 'OTP verified successfully',
                    'user_id'         => $user->id,
                    'user_name'       => $user->name,
                    'is_authenticate' => true,
                    'portal_token' => $authToken,
                ], 200);
            } else {
                return response()->json([
                    'status'  => false,
                    'message' => 'Invalid OTP or OTP expired',
                ], 401);
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
            $user = auth()->user();

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
