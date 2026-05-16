<?php

use App\Http\Controllers\Api\SemanaGestacionalController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);

Route::prefix('semanas-gestacionais')->name('semanas-gestacionais.')->group(function () {

    Route::get('/', [SemanaGestacionalController::class, 'index'])
        ->name('index');

    Route::get('/trimestre/{trimestre}', [SemanaGestacionalController::class, 'porTrimestre'])
        ->name('por-trimestre')
        ->where('trimestre', '[1-3]');

    Route::get('/{semana}', [SemanaGestacionalController::class, 'show'])
        ->name('show')
        ->where('semana', '[0-9]+');
});