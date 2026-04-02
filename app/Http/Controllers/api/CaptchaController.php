<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CaptchaController extends Controller
{
    /**
     * Verify Cloudflare Turnstile token
     * 
     * REST API Endpoint: POST /verify-turnstile
     * Request Body: { "token": "...", "phone": "..." }
     * Response: { "success": true/false, "message": "...", "sms_status": "..." }
     * 
     * FLOW:
     * 1. Frontend sends token after user completes captcha
     * 2. Backend receives token and validates it with Cloudflare
     * 3. If valid, prepare to send SMS OTP
     * 4. Return success/failure to frontend
     */

    public function verify(Request $request)
    {
        // ===== STEP 1: VALIDATE REQUEST INPUT =====
        // Check if token and phone are provided
        $validated = $request->validate([
            'token' => 'required|string|min:1',
            'phone' => 'required|string|digits:10',
        ], [
            'token.required' => 'Verification token is missing',
            'phone.required' => 'Phone number is required',
            'phone.digits' => 'Phone number must be 10 digits',
        ]);

        try {
            // ===== STEP 2: GET SECRET KEY FROM ENV =====
            $secret = env('TURNSTILE_SECRET');
            
            if (!$secret) {
                Log::error('TURNSTILE_SECRET not configured in .env');
                return response()->json([
                    'success' => false,
                    'message' => 'Server is misconfigured. Contact support.'
                ], 500);
            }

            // ===== STEP 3: CALL CLOUDFLARE API =====
            // Send token to Cloudflare for verification
            $response = Http::asForm()->post(
                'https://challenges.cloudflare.com/turnstile/v0/siteverify',
                [
                    'secret' => $secret,
                    'response' => $validated['token'],
                    'remoteip' => $request->ip(),
                ]
            );

            // ===== STEP 4: GET CLOUDFLARE RESPONSE =====
            $cloudflareResponse = $response->json();

            // Log the response for debugging
            Log::info('Turnstile verification response', [
                'success' => $cloudflareResponse['success'] ?? false,
                'phone' => $validated['phone'],
            ]);

            // ===== STEP 5: CHECK IF VERIFICATION SUCCESSFUL =====
            if (isset($cloudflareResponse['success']) && $cloudflareResponse['success'] === true) {
                
                // ✅ HUMAN VERIFIED! Proceed with SMS OTP
                
                // TODO: IMPLEMENT SMS SERVICE HERE
                // Example using Semaphore (popular in PH):
                /*
                $otp = rand(100000, 999999);
                
                $smsResponse = Http::post('https://semaphore.co/api/sms/send', [
                    'apikey' => env('SEMAPHORE_API_KEY'),
                    'number' => '63' . substr($validated['phone'], 1),
                    'message' => "Your Youth Money Bank OTP is: {$otp}"
                ]);
                
                // Store OTP in cache or database (with expiry)
                Cache::put('otp_' . $validated['phone'], $otp, now()->addMinutes(5));
                */

                Log::info('Turnstile verification successful for phone: ' . $validated['phone']);

                return response()->json([
                    'success' => true,
                    'message' => 'Verification successful',
                    'sms_status' => 'SMS code sent successfully',
                    'phone_number' => $validated['phone'],
                ], 200);
                
            } else {
                // ❌ VERIFICATION FAILED
                $errorCodes = $cloudflareResponse['error-codes'] ?? [];
                
                Log::warning('Turnstile verification failed', [
                    'phone' => $validated['phone'],
                    'errors' => $errorCodes,
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Verification failed. Please try again.',
                    'errors' => $errorCodes,
                ], 422);
            }

        } catch (\Exception $e) {
            // ===== STEP 6: HANDLE ERRORS =====
            Log::error('Captcha verification error', [
                'message' => $e->getMessage(),
                'phone' => $validated['phone'] ?? 'unknown',
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred during verification. Please try again.'
            ], 500);
        }
    }
}
/*
╔═══════════════════════════════════════════════════════════════╗
║            REST API ARCHITECTURE DIAGRAM                      ║
╚═══════════════════════════════════════════════════════════════╝

┌──────────────┐        REST API #1         ┌──────────────┐
│              │  ────────────────────────>  │              │
│   FRONTEND   │   POST /verify-turnstile   │   LARAVEL    │
│   (React)    │   Body: {token, phone}     │   BACKEND    │
│              │  <────────────────────────  │              │
└──────────────┘   Response: {success: true} └──────────────┘
                                                     │
                                                     │ REST API #2
                                                     ▼
                                             ┌──────────────┐
                                             │              │
                                             │  CLOUDFLARE  │
                                             │     API      │
                                             │              │
                                             └──────────────┘

╔═══════════════════════════════════════════════════════════════╗
║                  REST API PRINCIPLES USED                     ║
╚═══════════════════════════════════════════════════════════════╝

✅ 1. CLIENT-SERVER SEPARATION
   - Frontend (client) and Backend (server) are separate
   - Can be deployed independently
   
✅ 2. STATELESS
   - Each request contains all info needed
   - Server doesn't store session data between requests
   
✅ 3. HTTP METHODS
   - POST /verify-turnstile (create/verify operation)
   
✅ 4. JSON FORMAT
   - Request: {"token": "...", "phone": "..."}
   - Response: {"success": true, "message": "..."}
   
✅ 5. HTTP STATUS CODES
   - 200 = Success
   - 400 = Bad Request (missing token)
   - 422 = Validation Failed (invalid token)
   - 500 = Server Error

*/
/*
╔═══════════════════════════════════════════════════════════════════╗
║                    COMPLETE FLOW DIAGRAM                          ║
╚═══════════════════════════════════════════════════════════════════╝

USER SIDE (Frontend - React):
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "Verify Identity" button                         │
│ 2. Turnstile widget appears (checkbox/challenge)                │
│ 3. User completes verification (checkbox or puzzle)             │
│ 4. Turnstile generates TOKEN (e.g., "abc123xyz...")             │
│                                                                   │
│    const response = await fetch('/verify-turnstile', {          │
│        method: 'POST',                                           │
│        body: JSON.stringify({ token, phone: phoneNumber })      │
│    });                                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP POST
┌─────────────────────────────────────────────────────────────────┐
│ SERVER SIDE (Backend - Laravel):                                │
│                                                                   │
│ 5. Laravel receives token sa /verify-turnstile endpoint         │
│ 6. Laravel sends token to Cloudflare API for validation         │
│                                                                   │
│    POST https://challenges.cloudflare.com/turnstile/v0/siteverify │
│    Body: {                                                       │
│        secret: "YOUR_SECRET_KEY",                               │
│        response: "abc123xyz...",                                │
│        remoteip: "192.168.1.1"                                  │
│    }                                                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE API:                                                  │
│                                                                   │
│ 7. Cloudflare checks if token is valid                          │
│    - Is it from a real user?                                    │
│    - Is it expired? (tokens expire after use)                   │
│    - Is it a duplicate submission?                              │
│                                                                   │
│ Response: { "success": true } or { "success": false }           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ BACK TO LARAVEL:                                                 │
│                                                                   │
│ 8. If success = true:                                            │
│    ✅ Human verified!                                            │
│    - Send SMS OTP (TODO: implement this)                        │
│    - Return success to frontend                                 │
│                                                                   │
│ 9. If success = false:                                           │
│    ❌ Bot detected or invalid token                             │
│    - Return error to frontend                                   │
│    - Frontend should reset captcha                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Response
┌─────────────────────────────────────────────────────────────────┐
│ FRONTEND RECEIVES RESPONSE:                                      │
│                                                                   │
│ 10. If success:                                                  │
│     - Show "Verification Successful" message                    │
│     - Enable signup form                                        │
│     - User can proceed with registration                        │
│                                                                   │
│ 11. If failed:                                                   │
│     - Show error message                                        │
│     - Reset Turnstile widget                                    │
│     - User must try again                                       │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════╗
║                    IMPORTANT NOTES                                ║
╚═══════════════════════════════════════════════════════════════════╝

🔑 SECRET KEY:
   - Nasa .env file: TURNSTILE_SECRET=your_secret_here
   - NEVER i-expose sa frontend
   - Get this from Cloudflare dashboard

🌐 SITE KEY:
   - Yung '0x4AAAAAACCXzxGBQrb5Aa0c' sa React code
   - Public key, safe i-expose sa frontend
   - Get this from Cloudflare dashboard

⏰ TOKEN EXPIRY:
   - Tokens expire after ~5 minutes
   - Tokens can only be used ONCE
   - If expired/reused, Cloudflare returns error

🔒 SECURITY:
   - Always validate sa server-side
   - Never trust frontend validation alone
   - Bots can bypass frontend checks

📱 SMS INTEGRATION (TODO):
   - After successful verification, send OTP
   - Use services like Twilio, Semaphore, Vonage
   - Store OTP in database with expiry time

*/



/* ---sample code--


public function verify(Request $request)
{
    // =====================================
    // REST API ENDPOINT: POST /verify-turnstile
    // =====================================
    
    // 1️⃣ RECEIVE JSON REQUEST from Frontend
    $token = $request->input('token');  // Get data from request body
    $phone = $request->input('phone');
    
    // 2️⃣ VALIDATE REQUEST
    if (!$token) {
        return response()->json([  // ← REST API response in JSON format
            'success' => false,
            'message' => 'Token is missing'
        ], 400);  // ← HTTP Status Code
    }
    
    // 3️⃣ CALL EXTERNAL REST API (Cloudflare)
    $response = Http::asForm()->post(  // ← Making HTTP POST request
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $request->ip(),
        ]
    );
    
    // 4️⃣ GET JSON RESPONSE from Cloudflare API
    $cloudflareResponse = $response->json();  // ← Parse JSON response
    
    // 5️⃣ RETURN JSON RESPONSE to Frontend
    if ($cloudflareResponse['success']) {
        return response()->json([  // ← REST API response
            'success' => true,
            'message' => 'Verification successful',
            'sms_status' => 'SMS code sent successfully'
        ], 200);  // ← HTTP 200 OK
    } else {
        return response()->json([
            'success' => false,
            'message' => 'Verification failed'
        ], 422);  // ← HTTP 422 Unprocessable Entity
    }
}

*/