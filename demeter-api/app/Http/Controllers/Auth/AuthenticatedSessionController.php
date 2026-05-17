<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Formulario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // Gera o token Sanctum
        $token = $user->createToken('app')->plainTextToken;

        // Verifica se o usuário já preencheu o formulário
        $temFormulario = Formulario::where('user_id', $user->id)->exists();

        return response()->json([
            'token'          => $token,
            'tem_formulario' => $temFormulario,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        // Revoga todos os tokens do usuário autenticado
        $request->user()->tokens()->delete();

        Auth::guard('web')->logout();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }
}