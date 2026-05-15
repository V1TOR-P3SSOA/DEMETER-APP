<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReceitaController;
 
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('receitas', ReceitaController::class);
});

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

require __DIR__.'/auth.php';
