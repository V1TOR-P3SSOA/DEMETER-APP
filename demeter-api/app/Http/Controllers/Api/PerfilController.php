<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PerfilController extends Controller
{
    // GET /api/perfil
    public function show(Request $request): JsonResponse
    {
        $user       = $request->user();
        $formulario = Formulario::where('user_id', $user->id)->first();

        return response()->json([
            'usuario' => [
                'id'       => $user->id,
                'nome'     => $user->name,
                'email'    => $user->email,
                'foto_url' => $user->foto_url
                    ? Storage::url($user->foto_url)
                    : null,
            ],
            'formulario' => $formulario,
        ]);
    }

    // PATCH /api/perfil — atualiza nome e/ou email
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
                'id'       => $user->id,
                'nome'     => $user->name,
                'email'    => $user->email,
                'foto_url' => $user->foto_url
                    ? Storage::url($user->foto_url)
                    : null,
            ],
        ]);
    }

    // POST /api/perfil/foto — faz upload da foto de perfil
    public function uploadFoto(Request $request): JsonResponse
    {
        $request->validate([
            'foto' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $user = $request->user();

        // Remove foto antiga se existir
        if ($user->foto_url) {
            Storage::disk('public')->delete($user->foto_url);
        }

        $path = $request->file('foto')->store('fotos_perfil', 'public');
        $user->foto_url = $path;
        $user->save();

        return response()->json([
            'foto_url' => Storage::url($path),
        ]);
    }

    // DELETE /api/perfil — deleta a conta do usuário
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        // Remove foto de perfil se existir
        if ($user->foto_url) {
            Storage::disk('public')->delete($user->foto_url);
        }

        // Revoga todos os tokens Sanctum
        $user->tokens()->delete();

        // Deleta o usuário (cascade deleta formulário via migration)
        $user->delete();

        return response()->json(['message' => 'Conta deletada com sucesso.']);
    }
}