<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\DeliveryResetPasswordMail;
use App\Mail\PasswordResetSuccessMail;
use App\Mail\RegistrationMail;
use App\Models\AccountDeletion;
use App\Models\PasswordResetToken;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class PortalAuthenticateController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/portal/register",
     *     operationId="registerUser",
     *     tags={"Authentication"},
     *     summary="Register a new user",
     *     description="Creates a new user account with customer role",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name", "email", "password", "password_confirmation"},
     *
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=201,
     *         description="User registered successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Registration success"),
     *             @OA\Property(property="info", type="string", example="Please navigate to the login page...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", example={"email": {"The email field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="An error occurred during registration...")
     *         )
     *     )
     * )
     */
    public function register(Request $request)
    {
        try {
            $validateUser = Validator::make($request->all(), [
                'name'     => 'required',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
            ]);

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 422);
            }

            $roleId = Role::where('name', 'Customer')->first()->id;

            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role_id'  => $roleId,
                'status'   => 1,
            ]);

            $maskedPassword = substr($request->password, 0, 2).str_repeat('*', strlen($request->password) - 4).substr($request->password, -2);

            Mail::to($user->email)->queue(new RegistrationMail($user->email, $maskedPassword));

            return response()->json([
                'status'  => true,
                'message' => 'Registration success',
                'info'    => 'Please navigate to the login page, and after logging in, you can start using our service.',
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred during registration. Please try again later.',
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/login",
     *     operationId="loginUser",
     *     tags={"Authentication"},
     *     summary="Authenticate user",
     *     description="Logs in a user and returns an access token",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email", "password"},
     *
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Login successful",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="User Logged In Successfully"),
     *             @OA\Property(property="user_id", type="integer", example=1),
     *             @OA\Property(property="user_name", type="string", example="John Doe"),
     *             @OA\Property(property="is_authenticate", type="boolean", example=true),
     *             @OA\Property(property="portal_token", type="string", example="1|abcdef123456")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Email & Password do not match our records."),
     *             @OA\Property(property="info", type="string", example="Please check your credentials...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=403,
     *         description="Forbidden - Account inactive",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Account is inactive!"),
     *             @OA\Property(property="info", type="string", example="Please contact your Amo Market Administrator...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function login(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'email'    => 'required|email',
                    'password' => 'required',
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validateUser->errors(),
                ], 401);
            }

            if (! Auth::attempt($request->only(['email', 'password']))) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Email & Password do not match our records.',
                    'info'    => 'Please check your credentials and try again. If you have forgotten your password, use the "Forgot Password" option to reset it.',
                ], 401);
            }

            $user = Auth::user();

            if (is_null($user->role_id) || $user->role_id === '' || $user->status === '0' || is_null($user->status) || $user->status === '') {
                return response()->json([
                    'status'  => false,
                    'message' => 'Account is inactive!',
                    'info'    => 'Please contact your Amo Market Administrator to activate your account.',
                ], 403);
            }

            $user->update(['login_time' => Carbon::now()]);

            return response()->json([
                'status'          => true,
                'message'         => 'User Logged In Successfully',
                'user_id'         => $user->id,
                'user_name'       => $user->name,
                'is_authenticate' => true,
                'portal_token'    => $user->createToken('API TOKEN')->plainTextToken,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/forgot_password",
     *     operationId="forgotPassword",
     *     tags={"Authentication"},
     *     summary="Request password reset",
     *     description="Sends a password reset link to the user's email",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"email"},
     *
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Reset link sent",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Reset link sent to your email")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="validation error"),
     *             @OA\Property(property="errors", type="object", example={"email": {"The email field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User not found"),
     *             @OA\Property(property="info", type="string", example="Please ensure you have registered with us...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'email' => 'required|email',
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'validation error',
                    'errors'  => $validateUser->errors(),
                ], 401);
            }

            $user = User::where('email', $request->email)->first();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'User not found',
                    'info'    => 'Please ensure you have registered with us. If you believe this is a mistake, contact support for Amo Market administrator.',
                ], 404);
            }

            $token = Str::random(60);

            $tokenData = PasswordResetToken::updateOrCreate(
                ['email' => $user->email],
                [
                    'id'    => Str::uuid(),
                    'token' => $token,
                ]
            );

            Mail::to($user->email)->queue(new DeliveryResetPasswordMail($token));

            return response()->json([
                'status'  => true,
                'message' => 'Reset link sent to your email',
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/reset_password",
     *     operationId="resetPassword",
     *     tags={"Authentication"},
     *     summary="Reset user password",
     *     description="Resets the user's password using a valid token",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"token", "password", "password_confirmation"},
     *
     *             @OA\Property(property="token", type="string", example="abc123"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Password reset successful",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password has been reset successfully."),
     *             @OA\Property(property="info", type="string", example="Go to the login page...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Invalid token",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid or expired token. Try again."),
     *             @OA\Property(property="info", type="string", example="The password reset link may have expired...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="validation error"),
     *             @OA\Property(property="errors", type="object", example={"password": {"The password field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="User not found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User not found."),
     *             @OA\Property(property="info", type="string", example="Please ensure you have registered with us...")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function resetPassword(Request $request)
    {
        try {
            $validateUser = Validator::make(
                $request->all(),
                [
                    'token'    => 'required|string',
                    'password' => 'required|string|min:6|confirmed',
                ]
            );

            if ($validateUser->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'validation error',
                    'errors'  => $validateUser->errors(),
                ], 401);
            }

            $passwordReset = PasswordResetToken::where('token', $request->token)->first();
            if (! $passwordReset) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token. Try again.',
                    'info'    => 'The password reset link may have expired or is incorrect. Please request a new password reset link to proceed.',
                ], 400);
            }

            $user = User::where('email', $passwordReset->email)->first();

            if (! $user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found.',
                    'info'    => 'Please ensure you have registered with us. If you believe this is a mistake, contact support for assistance.',
                ], 404);
            }

            $user->update([
                'password' => bcrypt($request->password),
            ]);

            $passwordReset->delete();

            Mail::to($user->email)->queue(new PasswordResetSuccessMail($user));

            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully.',
                'info'    => 'Go to the login page. After authentication, you can use our features.',
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    // [Rest of your methods with similar Swagger documentation...]
    // Continue with the same pattern for logout, changePassword, viewProfile, etc.

    /**
     * @OA\Get(
     *     path="/api/portal/auth/google",
     *     operationId="googleLogin",
     *     tags={"Social Authentication"},
     *     summary="Redirect to Google for authentication",
     *     description="Initiates the OAuth flow with Google",
     *
     *     @OA\Response(
     *         response=302,
     *         description="Redirect to Google's OAuth page"
     *     )
     * )
     */
    public function googleLogin()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * @OA\Get(
     *     path="/api/portal/auth/google/callback",
     *     operationId="googleHandle",
     *     tags={"Social Authentication"},
     *     summary="Handle Google OAuth callback",
     *     description="Processes the Google OAuth callback and authenticates/creates user",
     *
     *     @OA\Response(
     *         response=302,
     *         description="Redirect to dashboard with token"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function googleHandle()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::firstOrCreate(
                ['email' => $googleUser->email],
                [
                    'social_media_id' => $googleUser->id,
                    'name'            => $googleUser->name,
                    'avatar'          => $googleUser->avatar,
                    'login_time'      => Carbon::now(),
                    'status'          => '1',
                ]
            );

            $token = $user->createToken('API TOKEN')->plainTextToken;

            // dd($token);
            // return response()->json([
            //     'status' => true,
            //     'message' => 'Log In With Google Successfully',
            //     'token' => $token
            // ], 200);
            return redirect('http://localhost:3000/dashboard?token='.$token);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/auth/facebook",
     *     operationId="facebookLogin",
     *     tags={"Social Authentication"},
     *     summary="Redirect to Facebook for authentication",
     *     description="Initiates the OAuth flow with Facebook",
     *
     *     @OA\Response(
     *         response=302,
     *         description="Redirect to Facebook's OAuth page"
     *     )
     * )
     */
    public function facebookLogin()
    {
        return Socialite::driver('facebook')->stateless()->redirect();
    }

    /**
     * @OA\Get(
     *     path="/api/portal/auth/facebook/callback",
     *     operationId="facebookHandle",
     *     tags={"Social Authentication"},
     *     summary="Handle Facebook OAuth callback",
     *     description="Processes the Facebook OAuth callback and authenticates/creates user",
     *
     *     @OA\Response(
     *         response=302,
     *         description="Redirect to dashboard with token"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
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

            return redirect('http://localhost:3000/dashboard?token='.$token);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/delete_account",
     *     operationId="deleteAccount",
     *     tags={"Account Management"},
     *     summary="Delete user account",
     *     description="Deletes the authenticated user's account after storing the reason",
     *     security={{"bearerAuth": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"reason"},
     *
     *             @OA\Property(property="reason", type="string", example="Privacy concerns"),
     *             @OA\Property(property="feedback", type="string", example="Improve your privacy policy")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Account deleted successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Your account has been deleted successfully.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object", example={"reason": {"The reason field is required."}})
     *         )
     *     )
     * )
     */
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
            $formattedPhoneNumber = 'whatsapp:'.$phoneNumber;

            // Send WhatsApp message
            $message = $twilio->messages->create(
                $formattedPhoneNumber,                // WhatsApp recipient (with international code)
                [
                    'from' => 'whatsapp:'.env('TWILIO_WHATSAPP_NUMBER'), // Twilio WhatsApp number
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

    /**
     * @OA\Post(
     *     path="/api/portal/auth_mobile",
     *     operationId="authMobile",
     *     tags={"Mobile Authentication"},
     *     summary="Authenticate via mobile number",
     *     description="Initiates mobile authentication by sending OTP via WhatsApp",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"name", "number"},
     *
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="number", type="string", example="+1234567890")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="OTP sent successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP sent successfully"),
     *             @OA\Property(property="token", type="string", example="1|abcdef123456")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", example={"number": {"The number field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Failed to send OTP SMS")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/portal/verify_otp",
     *     operationId="verifyOtp",
     *     tags={"Mobile Authentication"},
     *     summary="Verify mobile OTP",
     *     description="Verifies the OTP sent to mobile number",
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"otp"},
     *
     *             @OA\Property(property="otp", type="string", example="123456")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="OTP verified successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="OTP verified successfully"),
     *             @OA\Property(property="portal_token", type="string", example="1|abcdef123456")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Invalid OTP",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid OTP or OTP expired")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", example={"otp": {"The otp field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/portal/profile_avatar",
     *     operationId="getProfileAvatar",
     *     tags={"Profile"},
     *     summary="Get user's profile avatar",
     *     description="Retrieves the authenticated user's profile avatar",
     *     security={{"bearerAuth": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Avatar retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Avatar retrieved successfully."),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="path", type="string", example="avatars/123.jpg")
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthorized access.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="Avatar not found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No Avatar found for the user.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="An error occurred while retrieving the avatar.")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/portal/roles",
     *     operationId="getAllRole",
     *     tags={"Roles"},
     *     summary="Get all available roles",
     *     description="Retrieves a list of all roles in the system",
     *
     *     @OA\Response(
     *         response=200,
     *         description="Roles retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Roles retrieved successfully."),
     *             @OA\Property(property="data", type="array", @OA\Items(
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="Admin"),
     *                 @OA\Property(property="created_at", type="string", format="date-time"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time")
     *             ))
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=404,
     *         description="No roles found",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No roles found.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="An error occurred while retrieving roles.")
     *         )
     *     )
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/portal/profile",
     *     operationId="viewProfile",
     *     tags={"Profile"},
     *     summary="Get authenticated user's profile",
     *     description="Retrieves the profile information of the currently authenticated user",
     *     security={{"bearerAuth": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Profile retrieved successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="user@example.com"),
     *                 @OA\Property(property="role", type="object",
     *                     @OA\Property(property="id", type="integer", example=2),
     *                     @OA\Property(property="name", type="string", example="Customer")
     *                 ),
     *                 @OA\Property(property="avatar", type="object", nullable=true)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No user logged in")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function viewProfile()
    {
        try {
            // Get the currently authenticated user
            $user = Auth::user();

            if (! $user) {
                return response()->json([
                    'status'  => false,
                    'message' => 'No user logged in',
                ], 401);
            }

            // Ensure $user is an Eloquent model instance
            $user = User::with(['role', 'avatar'])->find($user->id);

            // Return the user details as response
            return response()->json([
                'status' => true,
                'user'   => $user,
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'status'  => false,
                'message' => $th->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/change_password",
     *     operationId="changePassword",
     *     tags={"Authentication"},
     *     summary="Change user password",
     *     description="Changes the authenticated user's password after verifying the old password",
     *     security={{"bearerAuth": {}}},
     *
     *     @OA\RequestBody(
     *         required=true,
     *
     *         @OA\JsonContent(
     *             required={"old_password", "password", "password_confirmation"},
     *
     *             @OA\Property(property="old_password", type="string", format="password", example="oldPassword123"),
     *             @OA\Property(property="password", type="string", format="password", example="newPassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newPassword123")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=200,
     *         description="Password changed successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Password updated successfully."),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *                 @OA\Property(property="role_id", type="integer", example=2),
     *                 @OA\Property(property="status", type="integer", example=1)
     *             )
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=400,
     *         description="Invalid old password",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Old Password Is Incorrect. Try Again..")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Unauthenticated.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Validation error"),
     *             @OA\Property(property="errors", type="object", example={"password": {"The password field is required."}})
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
    public function changePassword(Request $request)
    {
        try {
            // Validate the request
            $validator = Validator::make($request->all(), [
                'old_password' => 'required|string|min:6',
                'password'     => 'required|string|min:6|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation error',
                    'errors'  => $validator->errors(),
                ], 400);
            }

            // Retrieve the authenticated user
            $user = Auth::user();

            // Check if the old password matches
            if (! Hash::check($request->old_password, $user->password)) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Old Password Is Incorrect. Try Again..',
                ], 400);
            }

            // Update the password
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            return response()->json([
                'status'  => true,
                'message' => 'Password updated successfully.',
                'user'    => $user,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/portal/logout",
     *     operationId="logout",
     *     tags={"Authentication"},
     *     summary="Logout user",
     *     description="Invalidates the current access token and logs out the user",
     *     security={{"bearerAuth": {}}},
     *
     *     @OA\Response(
     *         response=200,
     *         description="Logged out successfully",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logout successfully.")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=401,
     *         description="Unauthorized",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="No user logged in")
     *         )
     *     ),
     *
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *
     *         @OA\JsonContent(
     *
     *             @OA\Property(property="status", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Internal server error")
     *         )
     *     )
     * )
     */
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
