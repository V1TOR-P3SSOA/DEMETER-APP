<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SemanaGestacionalResource extends JsonResource
{
    public function toArray(Request $request): array
{
    return [
        'semana_gestacional'     => $this->semana_gestacional,
        'trimestre'              => $this->trimestre,
        'tamanho_feto'           => $this->tamanho_feto,
        'peso_estimado_gramas'   => $this->peso_estimado_gramas,
        'tamanho_estimado_cm'    => $this->tamanho_estimado_cm,
        'desenvolvimento_feto'   => $this->desenvolvimento_feto,
        'mudancas_corpo_mae'     => $this->mudancas_corpo_mae,
        'alimentos_recomendados' => $this->alimentos_recomendados,
        'nutrientes_necessarios' => $this->nutrientes_necessarios,
        'alertas'                => $this->alertas,
    ];
}
}