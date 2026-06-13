<?php
// app/Http/Controllers/Api/AdminStatsController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Formulario;
use App\Models\Artigo;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminStatsController extends Controller
{
    private function onlyAdmin(): void
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403);
        }
    }

    public function stats(): JsonResponse
    {
        $this->onlyAdmin();

        $agora        = Carbon::now();
        $semanaPassada = $agora->copy()->subDays(7);
        $inicioMes    = $agora->copy()->startOfMonth();

        $totalUsuarios            = User::count();
        $novosSemana              = User::where('created_at', '>=', $semanaPassada)->count();
        $semQuestionario          = User::whereDoesntHave('formulario')->count();
        $totalQuestionarios       = Formulario::count();
        $questionariosPreenchidos = Formulario::count(); // todos preenchidos
        $questionariosPendentes   = $semQuestionario;

        $totalArtigos    = Artigo::count();
        $artigosRecentes = Artigo::where('created_at', '>=', $semanaPassada)->count();
        $artigosMes      = Artigo::where('created_at', '>=', $inicioMes)->count();

        return response()->json([
            'total_usuarios'            => $totalUsuarios,
            'novos_essa_semana'         => $novosSemana,
            'sem_questionario'          => $semQuestionario,
            'total_questionarios'       => $totalQuestionarios,
            'questionarios_preenchidos' => $questionariosPreenchidos,
            'questionarios_pendentes'   => $questionariosPendentes,
            'total_artigos'             => $totalArtigos,
            'artigos_recentes'          => $artigosRecentes,
            'artigos_esse_mes'          => $artigosMes,
        ]);
    }
    public function cadastrosSemanas(): JsonResponse
    {
        $this->onlyAdmin();

        $semanas = [];
        for ($i = 3; $i >= 0; $i--) {
            $inicio = Carbon::now()->subWeeks($i)->startOfWeek();
            $fim    = Carbon::now()->subWeeks($i)->endOfWeek();

            $total = User::whereBetween('created_at', [$inicio, $fim])->count();

            $semanas[] = [
                'semana' => $inicio->format('d/m'),
                'total'  => $total,
            ];
        }

        return response()->json($semanas);
    }
}