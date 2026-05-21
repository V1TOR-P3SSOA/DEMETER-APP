{{-- resources/views/admin/receitas/_form.blade.php --}}
{{--
    Partial reutilizado em create.blade.php e edit.blade.php.
    Espera as variáveis:
      - $enums  : array com todas as opções dos campos enum
      - $receita: modelo Receita (pode ser null em criação)
--}}

{{-- Helper para preencher o valor antigo ou o valor do modelo --}}
@php
    $val = fn(string $field) => old($field, $receita?->$field ?? '');
@endphp

<label>
    Nome da receita
    <input type="text" name="nome" value="{{ $val('nome') }}" required>
</label>
<br>

<label>
    Período da gestação
    <select name="tempo" required>
        <option value="">Selecione...</option>
        @foreach($enums['tempo'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('tempo') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Nutriente principal
    <select name="nutrientes_principais" required>
        <option value="">Selecione...</option>
        @foreach($enums['nutrientes_principais'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('nutrientes_principais') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Sintoma da gestação
    <select name="sintomas_gestacao" required>
        <option value="">Selecione...</option>
        @foreach($enums['sintomas_gestacao'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('sintomas_gestacao') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Restrições alimentares
    <select name="restricoes_alimentares" required>
        <option value="">Selecione...</option>
        @foreach($enums['restricoes_alimentares'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('restricoes_alimentares') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Tipo de refeição
    <select name="tipos_refeicoes" required>
        <option value="">Selecione...</option>
        @foreach($enums['tipos_refeicoes'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('tipos_refeicoes') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Tempo de preparo
    <select name="tempo_preparo" required>
        <option value="">Selecione...</option>
        @foreach($enums['tempo_preparo'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('tempo_preparo') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Objetivo nutricional
    <select name="objetivo_nutricional" required>
        <option value="">Selecione...</option>
        @foreach($enums['objetivo_nutricional'] as $opcao)
            <option value="{{ $opcao }}" {{ $val('objetivo_nutricional') === $opcao ? 'selected' : '' }}>
                {{ ucfirst($opcao) }}
            </option>
        @endforeach
    </select>
</label>
<br>

<label>
    Ingredientes
    <textarea name="ingredientes" rows="5" required>{{ $val('ingredientes') }}</textarea>
</label>
<br>

<label>
    Modo de preparo
    <textarea name="modo_preparo" rows="8" required>{{ $val('modo_preparo') }}</textarea>
</label>
<br>