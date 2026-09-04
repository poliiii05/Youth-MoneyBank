<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
 * Support hygiene. Runs daily rather than hourly: the point is to clear
 * conversations people have genuinely walked away from, and checking more
 * often would not find them any sooner.
 */
Schedule::command('support:close-stale --days=3 --abandoned=30')
    ->dailyAt('03:00')
    ->withoutOverlapping();