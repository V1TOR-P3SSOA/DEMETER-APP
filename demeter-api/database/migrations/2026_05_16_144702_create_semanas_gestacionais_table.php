<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('semanas_gestacionais', function (Blueprint $table) {
            $table->id();

            $table->unsignedTinyInteger('semana_gestacional')->unique()->comment('Semana da gestação (4 a 40)');
            $table->unsignedTinyInteger('trimestre')->comment('1, 2 ou 3');

            // Tamanho e peso do feto
            $table->string('tamanho_feto', 100)->comment('Comparação com fruta/objeto');
            $table->unsignedSmallInteger('peso_estimado_gramas')->nullable()->comment('Peso estimado em gramas');
            $table->decimal('tamanho_estimado_cm', 5, 1)->nullable()->comment('Comprimento estimado em cm');

            // Conteúdo descritivo (textos longos)
            $table->text('desenvolvimento_feto')->comment('Descrição do desenvolvimento do feto na semana');
            $table->text('mudancas_corpo_mae')->comment('Mudanças no corpo da mãe');

            // Listas estruturadas como JSONB (performático no PostgreSQL/Supabase)
            $table->jsonb('alimentos_recomendados')->comment('Lista de alimentos recomendados');
            $table->jsonb('alertas')->comment('Alertas e cuidados importantes da semana');
            $table->jsonb('nutrientes_necessarios')->comment('Nutrientes essenciais com descrição');

            $table->timestamps();
        });

        // Índice para buscas frequentes por semana
        DB::statement('CREATE INDEX idx_semana_gestacional ON semanas_gestacionais (semana_gestacional)');

        // Índice por trimestre para filtros
        DB::statement('CREATE INDEX idx_trimestre ON semanas_gestacionais (trimestre)');
    }

    public function down(): void
    {
        Schema::dropIfExists('semanas_gestacionais');
    }
};