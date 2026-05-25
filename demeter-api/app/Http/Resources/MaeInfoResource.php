<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaeInfoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        /** @var \App\Models\Formulario $formulario */
        $formulario = $this->resource['formulario'];

        $peso         = (float) $formulario->peso;
        $alturaMetros = (float) $formulario->altura / 100;
        $imc          = round($peso / ($alturaMetros ** 2), 2);

        $classificacaoImc = match (true) {
            $imc < 18.5 => 'Abaixo do peso',
            $imc < 25.0 => 'Peso normal',
            $imc < 30.0 => 'Sobrepeso',
            default     => 'Obesidade',
        };

        // 35ml por kg + 300ml extra para gestantes
        $aguaLitros = round(($peso * 35 + 300) / 1000, 2);

        return [
            'nome'                    => $this->resource['nome'],
            'idade'                   => $formulario->idade,
            'peso_kg'                 => $peso,
            'altura_cm'               => (float) $formulario->altura,
            'imc'                     => $imc,
            'classificacao_imc'       => $classificacaoImc,
            'trimestre'               => $this->resource['trimestre'],
            'agua_recomendada_litros' => $aguaLitros,
            'doencas'                 => $formulario->doencas,
            'restricoes_alimentares'  => $formulario->restricoes_alimentares,
        ];
    }
}