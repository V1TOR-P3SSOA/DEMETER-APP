<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Formulario;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FormularioController extends Controller
{
    // Salva o formulário do usuário autenticado
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'idade'                  => 'required|integer|min:1|max:120',
            'semanas_gestacao'       => 'required|integer|min:1|max:45',
            'primeira_gestacao'      => 'required',
            'tipo_gestacao'          => 'required|string',
            'altura'                 => 'required|numeric|min:100|max:250',
            'peso'                   => 'required|numeric|min:30|max:300',
            'objetivos'              => 'nullable|array',
            'restricoes_alimentares' => 'nullable|array',
            'sintomas'               => 'nullable|array',
            'suplementos'            => 'nullable|string|max:500',
            'doencas'                => 'nullable|string|max:500',
            'acompanhamento_medico'  => 'nullable',
        ]);

        // Normaliza booleanos vindos como string do app
        $validated['primeira_gestacao']     = filter_var($validated['primeira_gestacao'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ?? ($validated['primeira_gestacao'] === 'Sim');
        $validated['acompanhamento_medico'] = filter_var($validated['acompanhamento_medico'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)
            ?? ($validated['acompanhamento_medico'] === 'Sim');

        // Normaliza tipo_gestacao para os valores esperados pelo banco
        $validated['tipo_gestacao'] = match (strtolower(trim($validated['tipo_gestacao']))) {
            'única', 'unica' => 'unica',
            'gemelar'        => 'gemelar',
            default          => strtolower(trim($validated['tipo_gestacao'])),
        };

        $formulario = Formulario::updateOrCreate(
            ['user_id' => $request->user()->id],
            array_merge($validated, ['user_id' => $request->user()->id])
        );

        return response()->json($formulario, 201);
    }

    // Retorna o formulário do usuário autenticado
    public function show(Request $request): JsonResponse
    {
        $formulario = Formulario::where('user_id', $request->user()->id)->first();

        if (!$formulario) {
            return response()->json(['message' => 'Formulário não encontrado.'], 404);
        }

        return response()->json($formulario);
    }
}