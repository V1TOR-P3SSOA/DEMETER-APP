<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MaeInfoResource;
use App\Models\SemanaGestacional;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaeInfoController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user       = $request->user();
        $formulario = $user->formulario()->latest()->first();

        if (!$formulario) {
            return response()->json([
                'message' => 'Formulário não encontrado. Complete seu cadastro para continuar.',
            ], 404);
        }

        $semana    = SemanaGestacional::buscarPorSemana($formulario->semanas_gestacao);
        $trimestre = $semana?->trimestre;

        return response()->json(
            new MaeInfoResource([
                'nome'       => $user->name,
                'formulario' => $formulario,
                'trimestre'  => $trimestre,
            ])
        );
    }
}