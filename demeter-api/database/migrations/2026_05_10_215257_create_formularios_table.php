<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('formularios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedTinyInteger('idade');
            $table->unsignedTinyInteger('semanas_gestacao');
            $table->boolean('primeira_gestacao');
            $table->enum('tipo_gestacao', ['unica', 'gemelar']);
            $table->decimal('altura', 5, 2); // em cm, ex: 165.00
            $table->decimal('peso', 5, 2);   // em kg, ex: 65.50
            $table->json('objetivos')->nullable();
            $table->json('restricoes_alimentares')->nullable();
            $table->json('sintomas')->nullable();
            $table->string('suplementos')->nullable();
            $table->string('doencas')->nullable();
            $table->boolean('acompanhamento_medico')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('formularios');
    }
};