<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class InvitationController extends Controller
{
    public function accept(string $token)
    {
        $user = User::query()
            ->where('invitation_token', $token)
            ->where('invitation_expires_at', '>', now())
            ->first();

        if (!$user) {
            return view('auth.invitation-invalid');
        }

        return view('auth.invitation-accept', [
            'token' => $token,
            'email' => $user->email,
            'name' => $user->name,
        ]);
    }

    public function complete(Request $request, string $token): JsonResponse
    {
        $user = User::query()
            ->where('invitation_token', $token)
            ->where('invitation_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired invitation'], 422);
        }

        $validator = Validator::make($request->all(), [
            'password' => 'required|string|min:10|confirmed',
        ]);

        if ($validator->fails()) {
            throw ValidationException::withMessages($validator->errors()->toArray());
        }

        $user->update([
            'password' => Hash::make($request->password),
            'invitation_token' => null,
            'invitation_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Password set successfully',
            'redirect' => route('login'),
        ]);
    }
}