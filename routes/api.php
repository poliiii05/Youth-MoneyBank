<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CaptchaController;   // <- IMPORTANT: note the "Api" namespace

Route::post('verify-turnstile', [CaptchaController::class, 'verify']);
