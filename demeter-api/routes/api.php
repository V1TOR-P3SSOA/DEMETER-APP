<?php

use App\Http\Controllers\Api\SemanaGestacionalController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormularioController;
use App\Http\Controllers\Api\ReceitaApiController;
use App\Http\Controllers\Api\MaeInfoController;
use App\Http\Controllers\Api\ArtigoApiController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\AdminstatsController;

// ─── Rotas autenticadas ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Formulário gestacional
    Route::post('/formulario', [FormularioController::class, 'store']);
    Route::get('/formulario',  [FormularioController::class, 'show']);

    // Perfil do usuário
    Route::get('/perfil',   [PerfilController::class, 'show']);
    Route::patch('/perfil', [PerfilController::class, 'update']);
    Route::post('/perfil/foto',  [PerfilController::class, 'uploadFoto']);
    Route::delete('/perfil',     [PerfilController::class, 'destroy']);

    // Informações da mãe
    Route::get('/mae/info', [MaeInfoController::class, 'show']);

    // Semana gestacional do usuário autenticado
    Route::get('/semanas-gestacionais/minha-semana', [SemanaGestacionalController::class, 'semanaDoUsuario']);

    // Receitas (autenticadas)
    Route::prefix('receitas')->group(function () {
        Route::get('/',          [ReceitaApiController::class, 'index']);
        Route::get('/tags',      [ReceitaApiController::class, 'tags']);
        Route::get('/{receita}', [ReceitaApiController::class, 'show']);
    });
    
    Route::get('/admin/stats',               [AdminstatsController::class, 'stats']);
    Route::get('/admin/cadastros-recentes',  [AdminstatsController::class, 'cadastrosRecentes']);
    Route::get('/admin/cadastros-semanas',   [AdminstatsController::class, 'cadastrosSemanas']);
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/login',    [\App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('/logout',   [\App\Http\Controllers\Api\AuthController::class, 'logout']);

// ─── Semanas gestacionais (públicas) ─────────────────────────────────────────
Route::prefix('semanas-gestacionais')->name('semanas-gestacionais.')->group(function () {
    Route::get('/', [SemanaGestacionalController::class, 'index'])->name('index');
    Route::get('/atual', [SemanaGestacionalController::class, 'semanaAtual'])->name('atual');
    Route::get('/trimestre/{trimestre}', [SemanaGestacionalController::class, 'porTrimestre'])
        ->name('por-trimestre')
        ->where('trimestre', '[1-3]');
    Route::get('/{semana}', [SemanaGestacionalController::class, 'show'])
        ->name('show')
        ->where('semana', '[0-9]+');
});

// ─── Receitas (públicas) ──────────────────────────────────────────────────────
Route::prefix('receitas')->name('api.receitas.')->group(function () {
    Route::get('/',          [ReceitaApiController::class, 'index'])->name('index');
    Route::get('/tags',      [ReceitaApiController::class, 'tags'])->name('tags');
    Route::get('/{receita}', [ReceitaApiController::class, 'show'])->name('show');
});

// ─── Admin receitas ───────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('admin/receitas')->group(function () {
    Route::post('/',            [ReceitaApiController::class, 'store']);
    Route::put('/{receita}',    [ReceitaApiController::class, 'update']);
    Route::delete('/{receita}', [ReceitaApiController::class, 'destroy']);
});

// ─── Artigos (públicos) ───────────────────────────────────────────────────────
Route::prefix('artigos')->group(function () {
    Route::get('/',         [ArtigoApiController::class, 'index']);
    Route::get('/{artigo}', [ArtigoApiController::class, 'show']);
});

// ─── Admin artigos ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->prefix('admin/artigos')->group(function () {
    Route::post('/',           [ArtigoApiController::class, 'store']);
    Route::put('/{artigo}',    [ArtigoApiController::class, 'update']);
    Route::delete('/{artigo}', [ArtigoApiController::class, 'destroy']);
});