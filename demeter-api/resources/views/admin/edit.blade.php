{{-- resources/views/admin/receitas/edit.blade.php --}}

<h1>Editar Receita</h1>

<a href="{{ route('admin.receitas.index') }}">Voltar</a>

@if($errors->any())
    <ul>
        @foreach($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif

<form action="{{ route('admin.receitas.update', $receita) }}" method="POST">
    @csrf
    @method('PUT')

    @include('admin.receitas._form')

    <button type="submit">Atualizar</button>
</form>