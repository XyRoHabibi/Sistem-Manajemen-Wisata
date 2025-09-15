<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DestinationController;

Route::get('/destinations', [DestinationController::class, 'index']);
Route::post('/destinations', [DestinationController::class, 'store']);
Route::get('/destinations/{destination}', [DestinationController::class, 'show']);
Route::post('/destinations/{destination}', [DestinationController::class, 'update']);
Route::delete('/destinations/{destination}', [DestinationController::class, 'destroy']);

Route::get('/destinations/{destination}/reviews', [DestinationController::class, 'listReviews']);
Route::post('/destinations/{destination}/reviews', [DestinationController::class, 'addReview']); 