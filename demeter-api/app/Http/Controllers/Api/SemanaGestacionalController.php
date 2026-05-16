<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SemanaGestacionalResource;
use App\Models\Formulario;
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
     * ✅ NOVO — Retorna a semana gestacional do usuário autenticado
     * com base no formulário que ele preencheu no onboarding.
     *
     * GET /api/semanas-gestacionais/minha-semana
     */
    public function semanaDoUsuario(Request $request): SemanaGestacionalResource|JsonResponse
    {
        // Busca o formulário do usuário autenticado
        $formulario = Formulario::where('user_id', $request->user()->id)->first();

        if (! $formulario) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => 'Você ainda não preencheu o formulário inicial.',
            ], 404);
        }

        $numeroSemana = (int) $formulario->semanas_gestacao;

        // Garante que a semana está dentro do range da tabela (4 a 40)
        $numeroSemana = max(4, min(40, $numeroSemana));

        $semanaGestacional = SemanaGestacional::buscarPorSemana($numeroSemana);

        if (! $semanaGestacional) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => "Não encontramos dados para a semana gestacional {$numeroSemana}.",
            ], 404);
        }

        return (new SemanaGestacionalResource($semanaGestacional))
            ->additional([
                'meta' => [
                    'semana_do_formulario' => $formulario->semanas_gestacao,
                    'semana_consultada'    => $numeroSemana,
                ],
            ]);
    }

    /**
     * Retorna a semana gestacional atual da usuária autenticada via DUM.
     * GET /api/semanas-gestacionais/atual
     */
    public function semanaAtual(Request $request): SemanaGestacionalResource|JsonResponse
    {
        $request->validate([
            'data_ultima_menstruacao' => ['required', 'date', 'before:today'],
        ], [
            'data_ultima_menstruacao.required' => 'A data da última menstruação é obrigatória.',
            'data_ultima_menstruacao.date'     => 'Informe uma data válida.',
            'data_ultima_menstruacao.before'   => 'A data deve ser anterior a hoje.',
        ]);

        $dataUltimaMenstruacao = \Carbon\Carbon::parse($request->date('data_ultima_menstruacao'));
        $numeroSemana = SemanaGestacional::calcularSemanaAtual($dataUltimaMenstruacao);

        $semanaGestacional = SemanaGestacional::buscarPorSemana($numeroSemana);

        if (! $semanaGestacional) {
            return response()->json([
                'sucesso'  => false,
                'mensagem' => "Não encontramos dados para a semana gestacional {$numeroSemana}.",
            ], 404);
        }

        return (new SemanaGestacionalResource($semanaGestacional))
            ->additional([
                'meta' => [
                    'semana_calculada'        => $numeroSemana,
                    'data_ultima_menstruacao' => $dataUltimaMenstruacao->toDateString(),
                ],
            ]);
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