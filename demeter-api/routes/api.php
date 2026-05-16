<?php

use App\Http\Controllers\Api\SemanaGestacionalController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormularioController;
use App\Http\Controllers\Api\ReceitaApiController;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/formulario', [FormularioController::class, 'store']);
    Route::get('/formulario', [FormularioController::class, 'show']);
});

Route::post('/register', [\App\Http\Controllers\Auth\RegisteredUserController::class, 'store']);
Route::post('/login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);

Route::prefix('receitas')->name('api.receitas.')->group(function () {
    Route::get('/',          [ReceitaApiController::class, 'index'])
        ->name('index');
    Route::get('/tags',      [ReceitaApiController::class, 'tags'])
        ->name('tags');
    Route::get('/{receita}', [ReceitaApiController::class, 'show'])
        ->name('show');
});

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