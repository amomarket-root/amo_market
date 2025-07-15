<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'openweathermap' => [
        'api_key' => env('OPENWEATHERMAP_API_KEY'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('APP_URL').'/api/login/google/callback' ?? env('GOOGLE_REDIRECT_URI'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('APP_URL').'/api/login/facebook/callback' ?? env('FACEBOOK_REDIRECT_URL'),
    ],

    'cashfree' => [
        'api_key' => env('CASHFREE_API_KEY'),
        'api_secret' => env('CASHFREE_API_SECRET'),
        'env' => env('CASHFREE_ENV', 'sandbox'), // Good practice with default value
        'webhook_secret' => env('CASHFREE_WEBHOOK_SECRET'),
    ],

    'two_factor' => [
        'api_key' => env('TWO_FACTOR_API_KEY'),
        'sms_url' => 'https://2factor.in/API/V1/',
    ],
];
