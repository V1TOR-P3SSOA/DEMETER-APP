<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'name.required'     => 'Informe seu nome.',
            'name.max'          => 'O nome pode ter no máximo 255 caracteres.',

            'email.required'    => 'Informe seu e-mail.',
            'email.email'       => 'Informe um e-mail válido.',
            'email.max'         => 'O e-mail pode ter no máximo 255 caracteres.',
            'email.unique'      => 'Este e-mail já está cadastrado.',

            'password.required'  => 'Informe uma senha.',
            'password.confirmed' => 'As senhas não coincidem.',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->string('password')),
        ]);

        event(new Registered($user));

        Auth::login($user);

        $token = $user->createToken('app')->plainTextToken;

        return response()->json(['token' => $token], 201);
    }
}