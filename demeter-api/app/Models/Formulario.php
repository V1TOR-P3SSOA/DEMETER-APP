<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Formulario extends Model
{
    protected $fillable = [
        'user_id',
        'idade',
        'semanas_gestacao',
        'primeira_gestacao',
        'tipo_gestacao',
        'altura',
        'peso',
        'objetivos',
        'restricoes_alimentares',
        'sintomas',
        'suplementos',
        'doencas',
        'acompanhamento_medico',
    ];

    // Converte automaticamente os campos JSON em arrays PHP
    protected $casts = [
        'objetivos'              => 'array',
        'restricoes_alimentares' => 'array',
        'sintomas'               => 'array',
        'primeira_gestacao'      => 'boolean',
        'acompanhamento_medico'  => 'boolean',
    ];

    // Relacionamento: formulário pertence a um usuário
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}