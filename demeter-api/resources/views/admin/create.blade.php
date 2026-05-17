{{-- resources/views/admin/receitas/create.blade.php --}}

<h1>Nova Receita</h1>

<a href="{{ route('admin.receitas.index') }}">Voltar</a>

@if($errors->any())
    <ul>
        @foreach($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
@endif

<form action="{{ route('admin.receitas.store') }}" method="POST">
    @csrf

    @include('admin.receitas._form', ['receita' => null])

    <button type="submit">Salvar</button>
</form>