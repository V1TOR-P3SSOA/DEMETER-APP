<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Artigo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArtigoApiController extends Controller
{
    /**
     * GET /api/artigos
     * Lista todos os artigos.
     */
    public function index(): JsonResponse
    {
        $artigos = Artigo::orderBy('created_at', 'desc')->get();

        return response()->json([
            'data'  => $artigos,
            'total' => $artigos->count(),
        ]);
    }

    /**
     * POST /api/admin/artigos
     * Cria um novo artigo.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titulo'   => 'required|string|max:255',
            'conteudo' => 'required|string',
            'foto_url' => 'nullable|string|url',
        ]);

        $artigo = Artigo::create($validated);

        return response()->json(['data' => $artigo], 201);
    }

    /**
     * GET /api/artigos/{artigo}
     * Retorna um artigo específico.
     */
    public function show(Artigo $artigo): JsonResponse
    {
        return response()->json(['data' => $artigo]);
    }

    /**
     * PUT /api/admin/artigos/{artigo}
     * Atualiza um artigo existente.
     */
    public function update(Request $request, Artigo $artigo): JsonResponse
    {
        $validated = $request->validate([
            'titulo'   => 'sometimes|string|max:255',
            'conteudo' => 'sometimes|string',
            'foto_url' => 'nullable|string|url',
        ]);

        $artigo->update($validated);

        return response()->json(['data' => $artigo]);
    }

    /**
     * DELETE /api/admin/artigos/{artigo}
     * Remove um artigo.
     */
    public function destroy(Artigo $artigo): JsonResponse
    {
        $artigo->delete();

        return response()->json(['message' => 'Artigo removido com sucesso.']);
    }
}