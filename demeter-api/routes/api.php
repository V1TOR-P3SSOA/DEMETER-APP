<?php

use App\Http\Controllers\Api\SemanaGestacionalController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormularioController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/formulario', [FormularioController::class, 'store']);
    Route::get('/formulario', [FormularioController::class, 'show']);
});

Route::post('/register', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);

Route::prefix('semanas-gestacionais')->name('semanas-gestacionais.')->group(function () {

    Route::get('/', [SemanaGestacionalController::class, 'index'])
        ->name('index');

     Route::get('/minha-semana', [SemanaGestacionalController::class, 'semanaDoUsuario'])
        ->name('minha-semana');
 
    Route::get('/atual', [SemanaGestacionalController::class, 'semanaAtual'])
        ->name('atual');
 
    Route::get('/trimestre/{trimestre}', [SemanaGestacionalController::class, 'porTrimestre'])
        ->name('por-trimestre')
        ->where('trimestre', '[1-3]');
 
    Route::get('/{semana}', [SemanaGestacionalController::class, 'show'])
        ->name('show')
        ->where('semana', '[0-9]+');
});