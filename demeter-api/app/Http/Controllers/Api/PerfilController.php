<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PerfilController extends Controller
{
    // GET /api/perfil
    // Retorna dados do usuário + formulário gestacional
    public function show(Request $request): JsonResponse
    {
        $user      = $request->user();
        $formulario = Formulario::where('user_id', $user->id)->first();

        return response()->json([
            'usuario' => [
                'id'    => $user->id,
                'nome'  => $user->name,
                'email' => $user->email,
            ],
            'formulario' => $formulario,
        ]);
    }

    // PATCH /api/perfil
    // Atualiza nome e/ou email do usuário
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'nome'  => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        if (isset($validated['nome']))  $user->name  = $validated['nome'];
        if (isset($validated['email'])) $user->email = $validated['email'];

        $user->save();

        return response()->json([
            'usuario' => [
                'id'    => $user->id,
                'nome'  => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}