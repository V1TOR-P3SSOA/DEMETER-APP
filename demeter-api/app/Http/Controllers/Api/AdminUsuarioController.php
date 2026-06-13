<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class AdminUsuarioController extends Controller
{
    public function index(): JsonResponse
    {
        $usuarios = User::orderBy('created_at', 'desc')->get()->map(fn($u) => [
            'id'         => $u->id,
            'nome'       => $u->name,
            'email'      => $u->email,
            'foto_url'   => $u->foto_url ? Storage::url($u->foto_url) : null,
            'created_at' => $u->created_at,
        ]);

        return response()->json(['data' => $usuarios]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->foto_url) {
            Storage::disk('public')->delete($user->foto_url);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Usuário deletado com sucesso.']);
    }
}