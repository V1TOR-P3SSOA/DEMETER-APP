{{-- resources/views/admin/receitas/show.blade.php --}}

<h1>{{ $receita->nome }}</h1>

<a href="{{ route('admin.receitas.index') }}">Voltar</a> |
<a href="{{ route('admin.receitas.edit', $receita) }}">Editar</a>

<table border="1" cellpadding="6">
    <tr><th>Período</th><td>{{ $receita->tempo }}</td></tr>
    <tr><th>Nutriente principal</th><td>{{ $receita->nutrientes_principais }}</td></tr>
    <tr><th>Sintoma</th><td>{{ $receita->sintomas_gestacao }}</td></tr>
    <tr><th>Restrição alimentar</th><td>{{ $receita->restricoes_alimentares }}</td></tr>
    <tr><th>Tipo de refeição</th><td>{{ $receita->tipos_refeicoes }}</td></tr>
    <tr><th>Tempo de preparo</th><td>{{ $receita->tempo_preparo }}</td></tr>
    <tr><th>Objetivo nutricional</th><td>{{ $receita->objetivo_nutricional }}</td></tr>
    <tr>
        <th>Ingredientes</th>
        <td>{{ $receita->ingredientes }}</td>
    </tr>
    <tr>
        <th>Modo de preparo</th>
        <td>{{ $receita->modo_preparo }}</td>
    </tr>
</table>