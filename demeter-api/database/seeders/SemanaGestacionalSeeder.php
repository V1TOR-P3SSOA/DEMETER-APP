<?php

namespace Database\Seeders;

use App\Models\SemanaGestacional;
use Illuminate\Database\Seeder;

class SemanaGestacionalSeeder extends Seeder
{
    public function run(): void
    {
        // Trunca a tabela antes de popular para evitar duplicatas
        SemanaGestacional::truncate();

        foreach ($this->dados() as $dado) {
            SemanaGestacional::create($dado);
        }

        $this->command->info('✅ Semanas gestacionais inseridas com sucesso: ' . count($this->dados()) . ' semanas.');
    }

    // ─── Base de dados ────────────────────────────────────────────────────────

    private function dados(): array
    {
        return [

            // ══════════════════════════════════════════
            // 1° TRIMESTRE (semanas 4 a 13)
            // ══════════════════════════════════════════

            [
                'semana_gestacional'     => 4,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Semente de papoula',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'O embrião está nos estágios iniciais de formação. Pode ocorrer um leve sangramento rosado ou marrom chamado sangramento de implantação.',
                'mudancas_corpo_mae'     => 'Náuseas e sonolência podem começar a aparecer.',
                'alimentos_recomendados' => ['Torradas integrais', 'Banana', 'Gengibre', 'Água'],
                'alertas'                => ['Manter alimentação leve e frequente'],
                'nutrientes_necessarios' => ['Ácido fólico (vitamina B9): previne defeitos no tubo neural'],
            ],

            [
                'semana_gestacional'     => 5,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Semente de gergelim',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'O tubo neural se fecha, formando o cérebro e a medula espinhal.',
                'mudancas_corpo_mae'     => 'Os seios podem ficar mais sensíveis e inchados.',
                'alimentos_recomendados' => ['Leite', 'Iogurte', 'Queijo', 'Vegetais verdes'],
                'alertas'                => ['Evitar excesso de cafeína'],
                'nutrientes_necessarios' => ['Ácido fólico: auxilia o fechamento do tubo neural'],
            ],

            [
                'semana_gestacional'     => 6,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Lentilha',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'O coração começa a pulsar. Pequenos brotos aparecem, que serão os braços e as pernas.',
                'mudancas_corpo_mae'     => 'Os enjoos costumam ficar mais intensos nesta fase.',
                'alimentos_recomendados' => ['Bolachas simples', 'Arroz', 'Maçã', 'Gengibre'],
                'alertas'                => ['Não ficar longos períodos sem comer'],
                'nutrientes_necessarios' => ['Iodo: essencial para o desenvolvimento da tireoide fetal'],
            ],

            [
                'semana_gestacional'     => 7,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Mirtilo (cerca de 1 cm)',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 1.0,
                'desenvolvimento_feto'   => 'O rosto começa a se formar com pequenas aberturas para as narinas. O cérebro se desenvolve rapidamente e o embrião começa a se mover, embora imperceptível para a mãe.',
                'mudancas_corpo_mae'     => 'Pode haver alterações de humor e aumento do sono.',
                'alimentos_recomendados' => ['Aveia', 'Banana', 'Castanhas', 'Ovos'],
                'alertas'                => ['Priorizar descanso e hidratação'],
                'nutrientes_necessarios' => ['Ferro: começa a ser essencial para o aumento do volume sanguíneo da mãe'],
            ],

            [
                'semana_gestacional'     => 8,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Feijão vermelho',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'Braços e pernas ganham forma e os dedos começam a se separar.',
                'mudancas_corpo_mae'     => 'O útero começa a aumentar gradualmente.',
                'alimentos_recomendados' => ['Feijão', 'Carnes magras', 'Espinafre', 'Laranja'],
                'alertas'                => ['Atenção aos sinais de desidratação devido aos vômitos'],
                'nutrientes_necessarios' => ['Vitamina B12: para formação do sistema nervoso'],
            ],

            [
                'semana_gestacional'     => 9,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Uva',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'O embrião passa a ser chamado de feto. Já engole líquido amniótico, se estica e boceja. Os órgãos sexuais começam a se diferenciar.',
                'mudancas_corpo_mae'     => 'A circulação sanguínea aumenta e pode causar tonturas leves.',
                'alimentos_recomendados' => ['Água', 'Frutas', 'Vegetais', 'Proteínas leves'],
                'alertas'                => ['Levantar devagar para evitar quedas de pressão'],
                'nutrientes_necessarios' => ['Ômega 3: crucial para o desenvolvimento cerebral e dos olhos'],
            ],

            [
                'semana_gestacional'     => 10,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Noz-pecã',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'Todos os órgãos essenciais estão formados e começam a funcionar. O feto já possui impressões digitais únicas.',
                'mudancas_corpo_mae'     => 'O metabolismo acelera e o cansaço pode continuar intenso.',
                'alimentos_recomendados' => ['Batata-doce', 'Ovos', 'Frango', 'Abacate'],
                'alertas'                => ['Evitar ultraprocessados em excesso'],
                'nutrientes_necessarios' => ['Cálcio: para formação óssea inicial'],
            ],

            [
                'semana_gestacional'     => 11,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Tâmara',
                'peso_estimado_gramas'   => 'Ainda não é possível calcular o peso do embrião',
                'tamanho_estimado_cm'    => 'Ainda não é possível calcular o tamanho do embrião',
                'desenvolvimento_feto'   => 'A cabeça ainda é proporcionalmente grande. A movimentação é mais intensa, mas a mãe ainda não consegue sentir.',
                'mudancas_corpo_mae'     => 'As náuseas podem começar a diminuir para algumas gestantes.',
                'alimentos_recomendados' => ['Iogurte', 'Frutas', 'Arroz integral', 'Peixe cozido'],
                'alertas'                => ['Não interromper suplementações prescritas'],
                'nutrientes_necessarios' => ['Vitamina D: para o desenvolvimento ósseo e imunidade'],
            ],

            [
                'semana_gestacional'     => 12,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Limão',
                'peso_estimado_gramas'   => 14,
                'tamanho_estimado_cm'    => 5.5,
                'desenvolvimento_feto'   => 'O bebê abre e fecha a boca, dobra os dedos e pode ter soluço. A placenta está totalmente formada.',
                'mudancas_corpo_mae'     => 'O risco de aborto espontâneo diminui significativamente.',
                'alimentos_recomendados' => ['Salmão', 'Chia', 'Vegetais verdes', 'Feijão'],
                'alertas'                => ['Continuar o acompanhamento pré-natal regularmente'],
                'nutrientes_necessarios' => ['Proteínas: para manutenção da placenta'],
            ],

            [
                'semana_gestacional'     => 13,
                'trimestre'              => 1,
                'tamanho_feto'           => 'Pêssego',
                'peso_estimado_gramas'   => 23,
                'tamanho_estimado_cm'    => 7.4,
                'desenvolvimento_feto'   => 'O feto treina a respiração (o peito sobe e desce). As cordas vocais começam a se formar e o rosto já está mais definido.',
                'mudancas_corpo_mae'     => 'As náuseas podem diminuir e a energia começa a voltar.',
                'alimentos_recomendados' => ['Feijão', 'Ovos', 'Banana', 'Espinafre'],
                'alertas'                => ['Evitar longos períodos sem comer'],
                'nutrientes_necessarios' => ['Colina: para o desenvolvimento cerebral'],
            ],

            // ══════════════════════════════════════════
            // 2° TRIMESTRE (semanas 14 a 27)
            // ══════════════════════════════════════════

            [
                'semana_gestacional'     => 14,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Limão siciliano',
                'peso_estimado_gramas'   => 43,
                'tamanho_estimado_cm'    => 8.7,
                'desenvolvimento_feto'   => 'O bebê já consegue fazer pequenas expressões faciais e movimentos mais coordenados.',
                'mudancas_corpo_mae'     => 'A barriga começa a ficar mais evidente.',
                'alimentos_recomendados' => ['Leite', 'Iogurte', 'Laranja', 'Frango'],
                'alertas'                => ['Manter boa hidratação diária'],
                'nutrientes_necessarios' => ['Ferro', 'Vitamina C', 'Cálcio'],
            ],

            [
                'semana_gestacional'     => 15,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Maçã',
                'peso_estimado_gramas'   => 70,
                'tamanho_estimado_cm'    => 10.1,
                'desenvolvimento_feto'   => 'O sistema auditivo começa a se desenvolver e o bebê pode começar a perceber sons.',
                'mudancas_corpo_mae'     => 'Pode surgir aumento do apetite.',
                'alimentos_recomendados' => ['Aveia', 'Chia', 'Salmão', 'Maçã'],
                'alertas'                => ['Evitar excesso de cafeína'],
                'nutrientes_necessarios' => ['Ômega 3', 'Proteínas', 'Zinco'],
            ],

            [
                'semana_gestacional'     => 16,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Abacate',
                'peso_estimado_gramas'   => 100,
                'tamanho_estimado_cm'    => 11.6,
                'desenvolvimento_feto'   => 'Músculos e ossos estão mais fortes, permitindo movimentos mais intensos.',
                'mudancas_corpo_mae'     => 'A mãe pode começar a sentir os primeiros movimentos do bebê.',
                'alimentos_recomendados' => ['Queijo', 'Sardinha', 'Castanhas', 'Vegetais verdes'],
                'alertas'                => ['Não usar suplementos sem orientação médica'],
                'nutrientes_necessarios' => ['Cálcio', 'Vitamina D', 'Magnésio'],
            ],

            [
                'semana_gestacional'     => 17,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Romã',
                'peso_estimado_gramas'   => 140,
                'tamanho_estimado_cm'    => 13.0,
                'desenvolvimento_feto'   => 'Começa a formação da gordura corporal que ajudará na regulação térmica do bebê.',
                'mudancas_corpo_mae'     => 'Pode haver dores leves nas costas.',
                'alimentos_recomendados' => ['Carne magra', 'Feijão', 'Ovo', 'Brócolis'],
                'alertas'                => ['Evitar carregar muito peso'],
                'nutrientes_necessarios' => ['Ferro', 'Colina', 'Proteínas'],
            ],

            [
                'semana_gestacional'     => 18,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Batata-doce',
                'peso_estimado_gramas'   => 190,
                'tamanho_estimado_cm'    => 14.2,
                'desenvolvimento_feto'   => 'A audição melhora bastante e o bebê já pode ouvir a voz da mãe.',
                'mudancas_corpo_mae'     => 'Os movimentos fetais ficam mais perceptíveis.',
                'alimentos_recomendados' => ['Salmão', 'Chia', 'Leite', 'Espinafre'],
                'alertas'                => ['Evitar alimentos crus de procedência duvidosa'],
                'nutrientes_necessarios' => ['Ômega 3', 'Cálcio', 'Fósforo'],
            ],

            [
                'semana_gestacional'     => 19,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Manga',
                'peso_estimado_gramas'   => 240,
                'tamanho_estimado_cm'    => 15.3,
                'desenvolvimento_feto'   => 'Forma-se uma camada protetora na pele chamada vérnix caseoso.',
                'mudancas_corpo_mae'     => 'Pode ocorrer ressecamento da pele e coceiras.',
                'alimentos_recomendados' => ['Abacate', 'Azeite', 'Nozes', 'Cenoura'],
                'alertas'                => ['Usar hidratantes adequados para gestação'],
                'nutrientes_necessarios' => ['Ferro', 'Vitamina B12', 'Proteínas'],
            ],

            [
                'semana_gestacional'     => 20,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Banana',
                'peso_estimado_gramas'   => 300,
                'tamanho_estimado_cm'    => 16.4,
                'desenvolvimento_feto'   => 'Os movimentos ficam mais perceptíveis para a gestante.',
                'mudancas_corpo_mae'     => 'O centro de gravidade do corpo começa a mudar.',
                'alimentos_recomendados' => ['Iogurte', 'Banana', 'Arroz integral', 'Frango'],
                'alertas'                => ['Cuidado com quedas e desequilíbrio'],
                'nutrientes_necessarios' => ['Cálcio', 'Vitamina D', 'Ômega 3'],
            ],

            [
                'semana_gestacional'     => 21,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Cenoura',
                'peso_estimado_gramas'   => 360,
                'tamanho_estimado_cm'    => 26.7,
                'desenvolvimento_feto'   => 'O sistema digestório começa a praticar movimentos de sucção e deglutição.',
                'mudancas_corpo_mae'     => 'Pode surgir falta de ar leve após esforços.',
                'alimentos_recomendados' => ['Batata-doce', 'Carne', 'Lentilha', 'Mamão'],
                'alertas'                => ['Evitar excesso de sal'],
                'nutrientes_necessarios' => ['Ferro', 'Potássio', 'Proteína'],
            ],

            [
                'semana_gestacional'     => 22,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Mamão papaia',
                'peso_estimado_gramas'   => 430,
                'tamanho_estimado_cm'    => 27.8,
                'desenvolvimento_feto'   => 'As sobrancelhas e cabelos começam a aparecer com mais evidência.',
                'mudancas_corpo_mae'     => 'A circulação sanguínea aumenta bastante.',
                'alimentos_recomendados' => ['Beterraba', 'Feijão', 'Ovos', 'Laranja'],
                'alertas'                => ['Observar inchaços excessivos'],
                'nutrientes_necessarios' => ['Colina', 'Ômega 3', 'Cálcio'],
            ],

            [
                'semana_gestacional'     => 23,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Milho',
                'peso_estimado_gramas'   => 500,
                'tamanho_estimado_cm'    => 28.9,
                'desenvolvimento_feto'   => 'Os pulmões iniciam o desenvolvimento dos alvéolos pulmonares.',
                'mudancas_corpo_mae'     => 'O útero cresce rapidamente.',
                'alimentos_recomendados' => ['Frango', 'Peixe', 'Espinafre', 'Castanhas'],
                'alertas'                => ['Dormir preferencialmente de lado'],
                'nutrientes_necessarios' => ['Proteína', 'Ferro', 'Vitamina A'],
            ],

            [
                'semana_gestacional'     => 24,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Beringela',
                'peso_estimado_gramas'   => 600,
                'tamanho_estimado_cm'    => 30.0,
                'desenvolvimento_feto'   => 'O bebê já reage mais claramente a sons e estímulos externos.',
                'mudancas_corpo_mae'     => 'Pode haver azia com mais frequência.',
                'alimentos_recomendados' => ['Aveia', 'Pera', 'Arroz integral', 'Vegetais'],
                'alertas'                => ['Evitar refeições muito pesadas à noite'],
                'nutrientes_necessarios' => ['Cálcio', 'Magnésio', 'Vitamina K'],
            ],

            [
                'semana_gestacional'     => 25,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Couve-flor',
                'peso_estimado_gramas'   => 660,
                'tamanho_estimado_cm'    => 34.6,
                'desenvolvimento_feto'   => 'O sistema nervoso amadurece e melhora os reflexos corporais.',
                'mudancas_corpo_mae'     => 'O cansaço pode aumentar novamente.',
                'alimentos_recomendados' => ['Carne vermelha', 'Feijão', 'Kiwi', 'Ovos'],
                'alertas'                => ['Atenção aos níveis de ferro'],
                'nutrientes_necessarios' => ['Ferro', 'Vitamina C', 'Proteína'],
            ],

            [
                'semana_gestacional'     => 26,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Alface romana',
                'peso_estimado_gramas'   => 760,
                'tamanho_estimado_cm'    => 35.6,
                'desenvolvimento_feto'   => 'Os olhos começam a abrir parcialmente e respondem à luz.',
                'mudancas_corpo_mae'     => 'Cólicas leves e estiramentos podem aparecer.',
                'alimentos_recomendados' => ['Leite', 'Sardinha', 'Chia', 'Banana'],
                'alertas'                => ['Procurar médico em caso de dores intensas'],
                'nutrientes_necessarios' => ['Ômega 3', 'Cálcio', 'Zinco'],
            ],

            [
                'semana_gestacional'     => 27,
                'trimestre'              => 2,
                'tamanho_feto'           => 'Repolho',
                'peso_estimado_gramas'   => 875,
                'tamanho_estimado_cm'    => 36.6,
                'desenvolvimento_feto'   => 'O cérebro apresenta crescimento acelerado e maior atividade neural.',
                'mudancas_corpo_mae'     => 'O corpo começa a se preparar para o último trimestre.',
                'alimentos_recomendados' => ['Peixes', 'Nozes', 'Iogurte', 'Vegetais verdes'],
                'alertas'                => ['Monitorar pressão arterial e inchaço'],
                'nutrientes_necessarios' => ['Ferro', 'Proteína', 'Vitamina D'],
            ],

            // ══════════════════════════════════════════
            // 3° TRIMESTRE (semanas 28 a 40)
            // ══════════════════════════════════════════

            [
                'semana_gestacional'     => 28,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Berinjela grande',
                'peso_estimado_gramas'   => 1.5,
                'tamanho_estimado_cm'    => 37.6,
                'desenvolvimento_feto'   => 'O bebê começa a controlar melhor a temperatura corporal.',
                'mudancas_corpo_mae'     => 'O cansaço pode ficar mais frequente.',
                'alimentos_recomendados' => ['Feijão', 'Salmão', 'Ovos', 'Espinafre'],
                'alertas'                => ['Atenção a sinais de anemia'],
                'nutrientes_necessarios' => ['Ferro', 'Ômega 3', 'Proteína'],
            ],

            [
                'semana_gestacional'     => 29,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Abóbora menina',
                'peso_estimado_gramas'   => 1.1,
                'tamanho_estimado_cm'    => 38.6,
                'desenvolvimento_feto'   => 'Os músculos e pulmões continuam amadurecendo rapidamente.',
                'mudancas_corpo_mae'     => 'Pode haver dificuldade para dormir.',
                'alimentos_recomendados' => ['Leite', 'Banana', 'Aveia', 'Castanhas'],
                'alertas'                => ['Evitar excesso de açúcar'],
                'nutrientes_necessarios' => ['Cálcio', 'Magnésio', 'Vitamina D'],
            ],

            [
                'semana_gestacional'     => 30,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Repolho chinês',
                'peso_estimado_gramas'   => 1.3,
                'tamanho_estimado_cm'    => 39.9,
                'desenvolvimento_feto'   => 'O cérebro desenvolve mais conexões neurais e sulcos cerebrais.',
                'mudancas_corpo_mae'     => 'A barriga cresce rapidamente.',
                'alimentos_recomendados' => ['Frango', 'Lentilha', 'Chia', 'Peixe'],
                'alertas'                => ['Manter acompanhamento pré-natal regular'],
                'nutrientes_necessarios' => ['Proteína', 'Colina', 'Ferro'],
            ],

            [
                'semana_gestacional'     => 31,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Coco',
                'peso_estimado_gramas'   => 1.5,
                'tamanho_estimado_cm'    => 41.1,
                'desenvolvimento_feto'   => 'O bebê ganha mais gordura corporal e fica com aparência mais arredondada.',
                'mudancas_corpo_mae'     => 'Falta de ar leve pode aumentar.',
                'alimentos_recomendados' => ['Batata-doce', 'Ovos', 'Queijo', 'Vegetais verdes'],
                'alertas'                => ['Evitar esforço físico excessivo'],
                'nutrientes_necessarios' => ['Ômega 3', 'Cálcio', 'Potássio'],
            ],

            [
                'semana_gestacional'     => 32,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Jaca pequena',
                'peso_estimado_gramas'   => 1.7,
                'tamanho_estimado_cm'    => 42.4,
                'desenvolvimento_feto'   => 'Os movimentos respiratórios ficam mais frequentes como preparação para o nascimento.',
                'mudancas_corpo_mae'     => 'Contrações de treinamento (Braxton-Hicks) podem surgir.',
                'alimentos_recomendados' => ['Água', 'Frutas', 'Arroz integral', 'Carne magra'],
                'alertas'                => ['Procurar ajuda médica em contrações regulares'],
                'nutrientes_necessarios' => ['Ferro', 'Vitamina C', 'Proteína'],
            ],

            [
                'semana_gestacional'     => 33,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Abacaxi',
                'peso_estimado_gramas'   => 1.9,
                'tamanho_estimado_cm'    => 43.7,
                'desenvolvimento_feto'   => 'O sistema imunológico começa a receber anticorpos da mãe.',
                'mudancas_corpo_mae'     => 'Pode haver aumento do inchaço nos pés.',
                'alimentos_recomendados' => ['Laranja', 'Feijão', 'Peixe', 'Castanhas'],
                'alertas'                => ['Reduzir excesso de sódio'],
                'nutrientes_necessarios' => ['Ômega 3', 'Colina', 'Cálcio'],
            ],

            [
                'semana_gestacional'     => 34,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Melão',
                'peso_estimado_gramas'   => 2.1,
                'tamanho_estimado_cm'    => 45.0,
                'desenvolvimento_feto'   => 'As unhas chegam próximas às pontas dos dedos.',
                'mudancas_corpo_mae'     => 'O peso da barriga pode causar dores lombares.',
                'alimentos_recomendados' => ['Leite', 'Sardinha', 'Banana', 'Aveia'],
                'alertas'                => ['Cuidado com postura corporal'],
                'nutrientes_necessarios' => ['Proteína', 'Ferro', 'Vitamina K'],
            ],

            [
                'semana_gestacional'     => 35,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Melancia pequena',
                'peso_estimado_gramas'   => 2.3,
                'tamanho_estimado_cm'    => 46.2,
                'desenvolvimento_feto'   => 'Os rins já estão praticamente maduros e funcionando bem.',
                'mudancas_corpo_mae'     => 'A pressão na pelve aumenta.',
                'alimentos_recomendados' => ['Iogurte', 'Frango', 'Espinafre', 'Ovos'],
                'alertas'                => ['Observar perda de líquido'],
                'nutrientes_necessarios' => ['Cálcio', 'Magnésio', 'Vitamina D'],
            ],

            [
                'semana_gestacional'     => 36,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Mamão formosa',
                'peso_estimado_gramas'   => 2.6,
                'tamanho_estimado_cm'    => 47.4,
                'desenvolvimento_feto'   => 'O bebê normalmente se posiciona de cabeça para baixo em preparação para o parto.',
                'mudancas_corpo_mae'     => 'O bebê pode encaixar na pelve.',
                'alimentos_recomendados' => ['Água', 'Frutas', 'Proteína magra', 'Legumes'],
                'alertas'                => ['Atenção aos sinais do trabalho de parto'],
                'nutrientes_necessarios' => ['Ferro', 'Proteína', 'Ômega 3'],
            ],

            [
                'semana_gestacional'     => 37,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Acelga',
                'peso_estimado_gramas'   => 2.8,
                'tamanho_estimado_cm'    => 48.6,
                'desenvolvimento_feto'   => 'Os pulmões estão muito próximos da maturidade completa.',
                'mudancas_corpo_mae'     => 'O corpo começa a produzir mais hormônios para o parto.',
                'alimentos_recomendados' => ['Salmão', 'Leite', 'Arroz integral', 'Verduras'],
                'alertas'                => ['Não ignorar contrações frequentes'],
                'nutrientes_necessarios' => ['Cálcio', 'Ômega 3', 'Vitamina B12'],
            ],

            [
                'semana_gestacional'     => 38,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Alho-poró',
                'peso_estimado_gramas'   => 3.0,
                'tamanho_estimado_cm'    => 49.8,
                'desenvolvimento_feto'   => 'O cérebro continua se desenvolvendo intensamente mesmo próximo ao nascimento.',
                'mudancas_corpo_mae'     => 'O desconforto abdominal pode aumentar.',
                'alimentos_recomendados' => ['Frutas', 'Ovos', 'Peixe', 'Vegetais verdes'],
                'alertas'                => ['Descansar sempre que possível'],
                'nutrientes_necessarios' => ['Proteína', 'Ferro', 'Vitamina C'],
            ],

            [
                'semana_gestacional'     => 39,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Melancia pequena',
                'peso_estimado_gramas'   => 3.2,
                'tamanho_estimado_cm'    => 50.7,
                'desenvolvimento_feto'   => 'O corpo acumula mais gordura e energia para os primeiros dias de vida.',
                'mudancas_corpo_mae'     => 'O colo do útero começa a amolecer mais.',
                'alimentos_recomendados' => ['Água', 'Proteína', 'Alimentos leves', 'Legumes'],
                'alertas'                => ['Ficar atenta à bolsa rompida'],
                'nutrientes_necessarios' => ['Energia/calorias', 'Proteína', 'Cálcio'],
            ],

            [
                'semana_gestacional'     => 40,
                'trimestre'              => 3,
                'tamanho_feto'           => 'Abóbora grande',
                'peso_estimado_gramas'   => 3.4,
                'tamanho_estimado_cm'    => 51.2,
                'desenvolvimento_feto'   => 'O bebê está completamente desenvolvido e pronto para nascer.',
                'mudancas_corpo_mae'     => 'O corpo está totalmente preparado para o parto.',
                'alimentos_recomendados' => ['Refeições leves', 'Frutas', 'Hidratação adequada'],
                'alertas'                => ['Procurar assistência ao início do trabalho de parto'],
                'nutrientes_necessarios' => ['Ferro', 'Hidratação', 'Proteína'],
            ],
        ];
    }
}