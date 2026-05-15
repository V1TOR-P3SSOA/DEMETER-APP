<?php

namespace App\Http\Controllers;

use App\Models\Receita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReceitaController extends Controller
{
    // Enums centralizados — facilita reutilizar nas views
    public static array $enums = [
        'tempo' => [
            'semana 1-4', 'semana 5-8', 'semana 9-12',
            'segundo trimestre', 'terceiro trimestre', 'pré parto',
        ],
        'nutrientes_principais' => [
            'rico em ferro', 'rico em cálcio', 'rico em dha',
            'rico em proteínas', 'rico em fibras', 'rico em ácido fólico',
            'rico em vitamina c', 'rico em magnésio', 'rico em potássio', 'rico em colina',
        ],
        'sintomas_gestacao' => [
            'para enjoo', 'para azia', 'para constipação', 'para fadiga',
            'para inchaço', 'para anemia', 'para falta de apetite',
            'para desejos alimentares', 'energia rápida',
        ],
        'restricoes_alimentares' => [
            'vegetariana', 'vegana', 'sem lactose', 'sem glúten',
            'baixo açúcar', 'sem frutos do mar', 'sem oleaginosas', 'diabéticas',
        ],
        'tipos_refeicoes' => [
            'café da manhã', 'lanche', 'almoço', 'jantar',
            'sobremesa saudável', 'ceia', 'smoothie', 'marmita', 'refeição rápida',
        ],
        'tempo_preparo' => [
            'até 10 min', 'até 20 min', 'até 40 min', 'prática', 'uma panela só',
        ],
        'objetivo_nutricional' => [
            'ganho de peso saudável', 'controle glicêmico', 'aumento de ferro',
            'saúde intestinal', 'desenvolvimento cerebral do bebê',
            'fortalecimento ósseo', 'hidratação', 'imunidade',
        ],
    ];

    private function onlyAdmin(): void
    {
        if (Auth::user()->role !== 'admin') {
            abort(403, 'Acesso não autorizado.');
        }
    }

    /**
     * Lista todas as receitas no painel admin.
     */
    public function index()
    {
        $this->onlyAdmin();

        $receitas = Receita::orderBy('nome')->paginate(15);

        return view('admin.receitas.index', compact('receitas'));
    }

    /**
     * Exibe o formulário de criação.
     */
    public function create()
    {
        $this->onlyAdmin();

        $enums = self::$enums;

        return view('admin.receitas.create', compact('enums'));
    }

    /**
     * Salva uma nova receita.
     */
    public function store(Request $request)
    {
        $this->onlyAdmin();

        $validated = $request->validate([
            'nome'                  => 'required|string|max:255',
            'tempo'                 => 'required|in:' . implode(',', self::$enums['tempo']),
            'nutrientes_principais' => 'required|in:' . implode(',', self::$enums['nutrientes_principais']),
            'sintomas_gestacao'     => 'required|in:' . implode(',', self::$enums['sintomas_gestacao']),
            'restricoes_alimentares'=> 'required|in:' . implode(',', self::$enums['restricoes_alimentares']),
            'tipos_refeicoes'       => 'required|in:' . implode(',', self::$enums['tipos_refeicoes']),
            'tempo_preparo'         => 'required|in:' . implode(',', self::$enums['tempo_preparo']),
            'objetivo_nutricional'  => 'required|in:' . implode(',', self::$enums['objetivo_nutricional']),
            'ingredientes'          => 'required|string',
            'modo_preparo'          => 'required|string',
        ]);

        Receita::create($validated);

        return redirect()->route('admin.receitas.index')
            ->with('success', 'Receita cadastrada com sucesso!');
    }

    /**
     * Exibe uma receita específica (painel admin).
     */
    public function show(Receita $receita)
    {
        $this->onlyAdmin();

        return view('admin.receitas.show', compact('receita'));
    }

    /**
     * Exibe o formulário de edição.
     */
    public function edit(Receita $receita)
    {
        $this->onlyAdmin();

        $enums = self::$enums;

        return view('admin.receitas.edit', compact('receita', 'enums'));
    }

    /**
     * Atualiza uma receita existente.
     */
    public function update(Request $request, Receita $receita)
    {
        $this->onlyAdmin();

        $validated = $request->validate([
            'nome'                  => 'required|string|max:255',
            'tempo'                 => 'required|in:' . implode(',', self::$enums['tempo']),
            'nutrientes_principais' => 'required|in:' . implode(',', self::$enums['nutrientes_principais']),
            'sintomas_gestacao'     => 'required|in:' . implode(',', self::$enums['sintomas_gestacao']),
            'restricoes_alimentares'=> 'required|in:' . implode(',', self::$enums['restricoes_alimentares']),
            'tipos_refeicoes'       => 'required|in:' . implode(',', self::$enums['tipos_refeicoes']),
            'tempo_preparo'         => 'required|in:' . implode(',', self::$enums['tempo_preparo']),
            'objetivo_nutricional'  => 'required|in:' . implode(',', self::$enums['objetivo_nutricional']),
            'ingredientes'          => 'required|string',
            'modo_preparo'          => 'required|string',
        ]);

        $receita->update($validated);

        return redirect()->route('admin.receitas.index')
            ->with('success', 'Receita atualizada com sucesso!');
    }

    /**
     * Remove uma receita.
     */
    public function destroy(Receita $receita)
    {
        $this->onlyAdmin();

        $receita->delete();

        return redirect()->route('admin.receitas.index')
            ->with('success', 'Receita removida com sucesso!');
    }
}