<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ReceitaController;
use App\Models\Receita;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceitaApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Receita::query();

        if ($request->filled('search')) {
            $query->where('nome', 'like', '%' . $request->search . '%');
        }

        $tagFields = array_keys(ReceitaController::$enums);
        foreach ($tagFields as $field) {
            if ($request->filled($field)) {
                $value = $request->input($field);
                if (in_array($value, ReceitaController::$enums[$field])) {
                    $query->where($field, $value);
                }
            }
        }

        $receitas = $query->orderBy('nome')->get();

        return response()->json([
            'data'  => $receitas,
            'total' => $receitas->count(),
        ]);
    }

    public function tags(): JsonResponse
    {
        return response()->json([
            'data' => ReceitaController::$enums,
        ]);
    }

    public function show(Receita $receita): JsonResponse
    {
        return response()->json(['data' => $receita]);
    }

    /**
     * POST /api/receitas
     * Cria uma nova receita. foto_url vem pronta do Supabase Storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome'                   => 'required|string|max:255',
            'tempo'                  => 'required|in:' . implode(',', ReceitaController::$enums['tempo']),
            'nutrientes_principais'  => 'required|in:' . implode(',', ReceitaController::$enums['nutrientes_principais']),
            'sintomas_gestacao'      => 'required|in:' . implode(',', ReceitaController::$enums['sintomas_gestacao']),
            'restricoes_alimentares' => 'required|in:' . implode(',', ReceitaController::$enums['restricoes_alimentares']),
            'tipos_refeicoes'        => 'required|in:' . implode(',', ReceitaController::$enums['tipos_refeicoes']),
            'tempo_preparo'          => 'required|in:' . implode(',', ReceitaController::$enums['tempo_preparo']),
            'objetivo_nutricional'   => 'required|in:' . implode(',', ReceitaController::$enums['objetivo_nutricional']),
            'ingredientes'           => 'required|string',
            'modo_preparo'           => 'required|string',
            'foto_url'               => 'nullable|string|url',
        ]);

        $receita = Receita::create($validated);

        return response()->json(['data' => $receita], 201);
    }

    /**
     * PUT /api/receitas/{id}
     * Atualiza uma receita existente.
     */
    public function update(Request $request, Receita $receita): JsonResponse
    {
        $validated = $request->validate([
            'nome'                   => 'sometimes|string|max:255',
            'tempo'                  => 'sometimes|in:' . implode(',', ReceitaController::$enums['tempo']),
            'nutrientes_principais'  => 'sometimes|in:' . implode(',', ReceitaController::$enums['nutrientes_principais']),
            'sintomas_gestacao'      => 'sometimes|in:' . implode(',', ReceitaController::$enums['sintomas_gestacao']),
            'restricoes_alimentares' => 'sometimes|in:' . implode(',', ReceitaController::$enums['restricoes_alimentares']),
            'tipos_refeicoes'        => 'sometimes|in:' . implode(',', ReceitaController::$enums['tipos_refeicoes']),
            'tempo_preparo'          => 'sometimes|in:' . implode(',', ReceitaController::$enums['tempo_preparo']),
            'objetivo_nutricional'   => 'sometimes|in:' . implode(',', ReceitaController::$enums['objetivo_nutricional']),
            'ingredientes'           => 'sometimes|string',
            'modo_preparo'           => 'sometimes|string',
            'foto_url'               => 'nullable|string|url',
        ]);

        $receita->update($validated);

        return response()->json(['data' => $receita]);
    }

    /**
     * DELETE /api/receitas/{id}
     */
    public function destroy(Receita $receita): JsonResponse
    {
        $receita->delete();

        return response()->json(['message' => 'Receita removida com sucesso.']);
    }
}