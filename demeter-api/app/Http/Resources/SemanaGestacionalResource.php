<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SemanaGestacionalResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // Identificação
            'semana_gestacional' => $this->semana_gestacional,
            'trimestre'          => $this->trimestre,

            // Informações do feto
            'feto' => [
                'tamanho_comparativo' => $this->tamanho_feto,
                'imagem_url'          => $this->imagem_url,
                'peso_estimado_gramas' => $this->peso_estimado_gramas,
                'tamanho_estimado_cm'  => $this->tamanho_estimado_cm,
                'desenvolvimento'      => $this->desenvolvimento_feto,
            ],

            // Informações da mãe
            'mae' => [
                'mudancas_corpo' => $this->mudancas_corpo_mae,
            ],

            // Orientações nutricionais e de saúde
            'saude' => [
                'alimentos_recomendados'  => $this->alimentos_recomendados,
                'nutrientes_necessarios'  => $this->nutrientes_necessarios,
                'alertas'                 => $this->alertas,
            ],

            // Meta
            'atualizado_em' => $this->updated_at?->toIso8601String(),
        ];
    }
}