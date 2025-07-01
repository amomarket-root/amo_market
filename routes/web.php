<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return view('welcome'); // This should be the view that contains your React app
})->where('any', '.*');
