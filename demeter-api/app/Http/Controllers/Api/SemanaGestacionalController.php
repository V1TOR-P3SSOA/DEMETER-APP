<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SemanaGestacionalResource;
use App\Models\SemanaGestacional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SemanaGestacionalController extends Controller
{
    /**
     * Lista todas as semanas gestacionais ordenadas.
     * GET /api/semanas-gestacionais
     */
    public function index(): AnonymousResourceCollection
    {
        $semanas = SemanaGestacional::query()
            ->ordenadaPorSemana()
            ->get();

        return SemanaGestacionalResource::collection($semanas);
    }

    /**
     * Retorna os dados de uma semana gestacional específica.
     * GET /api/semanas-gestacionais/{semana}
     */
    public function show(int $semana): SemanaGestacionalResource|JsonResponse
    {
        if ($semana < 4 || $semana > 40) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => 'Semana gestacional inválida. Informe um valor entre 4 e 40.',
            ], 422);
        }

        $semanaGestacional = SemanaGestacional::buscarPorSemana($semana);

        if (! $semanaGestacional) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => "Não encontramos dados para a semana gestacional {$semana}.",
            ], 404);
        }

        return new SemanaGestacionalResource($semanaGestacional);
    }


    /**
     * Lista semanas de um trimestre específico.
     * GET /api/semanas-gestacionais/trimestre/{trimestre}
     */
    public function porTrimestre(int $trimestre): AnonymousResourceCollection|JsonResponse
    {
        if (! in_array($trimestre, [1, 2, 3])) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => 'Trimestre inválido. Informe 1, 2 ou 3.',
            ], 422);
        }

        $semanas = SemanaGestacional::query()
            ->porTrimestre($trimestre)
            ->ordenadaPorSemana()
            ->get();

        return SemanaGestacionalResource::collection($semanas)
            ->additional([
                'meta' => ['trimestre' => $trimestre],
            ]);
    }
}