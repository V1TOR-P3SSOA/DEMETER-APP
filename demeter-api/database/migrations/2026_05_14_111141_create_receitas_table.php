<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('receitas', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
            $table->string('nome');
            $table->enum('tempo', ['semana 1-4', 'semana 5-8', 'semana 9-12', 'segundo trimestre', 'terceiro trimestre', 'pré parto']);
            $table->enum('nutrientes_principais', ['rico em ferro', 'rico em cálcio', 'rico em dha', 'rico em proteínas', 'rico em fibras', 'rico em ácido fólico', 'rico em vitamina c', 'rico em magnésio', 'rico em potássio', 'rico em colina']);
            $table->enum('sintomas_gestacao', ['para enjoo', 'para azia', 'para constipação', 'para fadiga', 'para inchaço', 'para anemia', 'para falta de apetite', 'para desejos alimentares', 'energia rápida']);
            $table->enum('restricoes_alimentares', ['vegetariana', 'vegana', 'sem lactose', 'sem glúten', 'baixo açúcar', 'sem frutos do mar', 'sem oleaginosas', 'diabéticas']);
            $table->enum('tipos_refeicoes', ['café da manhã', 'lanche', 'almoço', 'jantar', 'sobremesa saudável', 'ceia', 'smoothie', 'marmita', 'refeição rápida']);
            $table->enum('tempo_preparo', ['até 10 min', 'até 20 min', 'até 40 min', 'prática', 'uma panela só']);
            $table->enum('objetivo_nutricional', ['ganho de peso saudável', 'controle glicêmico', 'aumento de ferro', 'saúde intestinal', 'desenvolvimento cerebral do bebê', 'fortalecimento ósseo', 'hidratação', 'imunidade']);
            $table->string('ingredientes');
            $table->string('modo_preparo');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('receitas');
    }
};
