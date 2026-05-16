<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\ReceitaController;
use App\Models\Receita;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReceitaApiController extends Controller
{
    /**
     * Retorna receitas filtradas pelas tags enviadas pelo app.
     *
     * Qualquer combinação de filtros pode ser enviada via query string:
     *   GET /api/receitas?tempo=segundo+trimestre&tipos_refeicoes=lanche
     *
     * Campos filtráveis (todos opcionais):
     *   - tempo
     *   - nutrientes_principais
     *   - sintomas_gestacao
     *   - restricoes_alimentares
     *   - tipos_refeicoes
     *   - tempo_preparo
     *   - objetivo_nutricional
     *
     * Também aceita busca por nome:
     *   GET /api/receitas?search=salada
     */
    public function index(Request $request): JsonResponse
    {
        $query = Receita::query();

        // Busca textual pelo nome da receita
        if ($request->filled('search')) {
            $query->where('nome', 'like', '%' . $request->search . '%');
        }

        // Filtros por tag (enum). Apenas campos válidos são aplicados.
        $tagFields = array_keys(ReceitaController::$enums);

        foreach ($tagFields as $field) {
            if ($request->filled($field)) {
                $value = $request->input($field);

                // Valida se o valor é uma opção permitida antes de filtrar
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

    /**
     * Retorna os valores disponíveis de todas as tags.
     * Útil para o app montar os chips/filtros dinamicamente.
     *
     *   GET /api/receitas/tags
     */
    public function tags(): JsonResponse
    {
        return response()->json([
            'data' => ReceitaController::$enums,
        ]);
    }

    /**
     * Retorna os detalhes completos de uma receita.
     *
     *   GET /api/receitas/{id}
     */
    public function show(Receita $receita): JsonResponse
    {
        return response()->json([
            'data' => $receita,
        ]);
    }
}