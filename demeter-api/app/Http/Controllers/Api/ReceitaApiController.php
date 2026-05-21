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
     * Retorna receitas ordenadas, aceitando filtros por tag e busca textual.
     * Mantém a estrutura de resposta com 'data' e 'total' para não quebrar o App.
     *
     * GET /api/receitas
     * GET /api/receitas?search=salada
     * GET /api/receitas?tempo=segundo+trimestre&tipos_refeicoes=lanche
     */
    public function index(Request $request): JsonResponse
    {
        $query = Receita::query();

        // 1. Busca textual pelo nome da receita (Funcionalidade do arquivo 1)
        if ($request->filled('search')) {
            $query->where('nome', 'like', '%' . $request->search . '%');
        }

        // 2. Filtros dinâmicos por tag/enum (Funcionalidade do arquivo 1)
        $tagFields = array_keys(ReceitaController::$enums);

        foreach ($tagFields as $field) {
            if ($request->filled($field)) {
                $value = $request->input($field);

                // Valida se o valor enviado é uma opção permitida no enum
                if (in_array($value, ReceitaController::$enums[$field])) {
                    $query->where($field, $value);
                }
            }
        }

        // 3. Ordenação e execução da query (Presente em ambos)
        $receitas = $query->orderBy('nome')->get();

        // Retorna o padrão estruturado (Evita que o FlutterFlow pare de ler os dados)
        return response()->json([
            'data'  => $receitas,
            'total' => $receitas->count(),
        ]);
    }

    /**
     * Retorna os valores disponíveis de todas as tags.
     * Útil para o app montar os chips/filtros dinamicamente.
     *
     * GET /api/receitas/tags
     */
    public function tags(): JsonResponse
    {
        return response()->json([
            'data' => ReceitaController::$enums,
        ]);
    }

    /**
     * Retorna os detalhes completos de uma única receita.
     *
     * GET /api/receitas/{id}
     */
    public function show(Receita $receita): JsonResponse
    {
        return response()->json([
            'data' => $receita,
        ]);
    }
}