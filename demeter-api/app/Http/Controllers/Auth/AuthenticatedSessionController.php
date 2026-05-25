<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Exibe a tela de login (web).
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Processa o login.
     * - Requisições web (browser): autentica via sessão e redireciona.
     * - Requisições API (Accept: application/json): retorna token Sanctum.
     */
    public function store(LoginRequest $request): JsonResponse|RedirectResponse
    {
        $request->authenticate();
        
        // Requisição da API (mobile)
        if ($request->expectsJson()) {
            $token = $request->user()->createToken('mobile')->plainTextToken;

            return response()->json([
                'token'          => $token,
                'tem_formulario' => $request->user()->formulario()->exists(),
            ]);
        }

        // Requisição web (browser/admin)
        $request->session()->regenerate();

        return redirect()->intended(route('admin.receitas.index'));
    }

    /**
     * Logout.
     */
    public function destroy(Request $request): JsonResponse|RedirectResponse
    {
        Auth::guard('web')->logout();

        if ($request->expectsJson()) {
            return response()->json(['message' => 'Logged out']);
        }

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}