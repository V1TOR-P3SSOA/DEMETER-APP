<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Receita extends Model
{
    protected $fillable = [
        'nome',
        'tempo',
        'nutrientes_principais',
        'sintomas_gestacao',
        'restricoes_alimentares',
        'tipos_refeicoes',
        'tempo_preparo',
        'objetivo_nutricional',
        'ingredientes',
        'modo_preparo'
    ];
}
