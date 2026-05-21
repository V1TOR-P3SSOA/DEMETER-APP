{{-- resources/views/admin/receitas/index.blade.php --}}

<h1>Receitas</h1>

@if(session('success'))
    <p>{{ session('success') }}</p>
@endif

<a href="{{ route('admin.receitas.create') }}">Nova Receita</a>

<table border="1" cellpadding="6">
    <thead>
        <tr>
            <th>Nome</th>
            <th>Período</th>
            <th>Tipo de Refeição</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody>
        @forelse($receitas as $receita)
            <tr>
                <td>{{ $receita->nome }}</td>
                <td>{{ $receita->tempo }}</td>
                <td>{{ $receita->tipos_refeicoes }}</td>
                <td>
                    <a href="{{ route('admin.receitas.show', $receita) }}">Ver</a> |
                    <a href="{{ route('admin.receitas.edit', $receita) }}">Editar</a> |
                    <form action="{{ route('admin.receitas.destroy', $receita) }}" method="POST"
                          onsubmit="return confirm('Deseja remover esta receita?')" style="display:inline">
                        @csrf
                        @method('DELETE')
                        <button type="submit">Excluir</button>
                    </form>
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="4">Nenhuma receita cadastrada.</td>
            </tr>
        @endforelse
    </tbody>
</table>

{{ $receitas->links() }}