<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class SemanaGestacional extends Model
{
    protected $table = 'semanas_gestacionais';

    protected $fillable = [
        'semana_gestacional',
        'trimestre',
        'tamanho_feto',
        'imagem_url',
        'peso_estimado_gramas',
        'tamanho_estimado_cm',
        'desenvolvimento_feto',
        'mudancas_corpo_mae',
        'alimentos_recomendados',
        'alertas',
        'nutrientes_necessarios',
    ];

    protected $casts = [
        'semana_gestacional'   => 'integer',
        'trimestre'            => 'integer',
        'peso_estimado_gramas' => 'integer',
        'tamanho_estimado_cm'  => 'float',
        'alimentos_recomendados' => 'array',
        'alertas'              => 'array',
        'nutrientes_necessarios' => 'array',
    ];

    // ─── Scopes ──────────────────────────────────────────────────────────────

    public function scopePorTrimestre(Builder $query, int $trimestre): Builder
    {
        return $query->where('trimestre', $trimestre);
    }

    public function scopeOrdenadaPorSemana(Builder $query): Builder
    {
        return $query->orderBy('semana_gestacional');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Busca a semana gestacional pelo número da semana (não pelo ID).
     */
    public static function buscarPorSemana(int $semana): ?static
    {
        return static::where('semana_gestacional', $semana)->first();
    }


}