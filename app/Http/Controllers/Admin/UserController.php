<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Warga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        $search = $request->query('search');
        $name = $request->query('name');
        $email = $request->query('email');
        $role = $request->query('role', 'Semua');
        $registered = $request->query('registered');

        if (!empty($search)) {
            $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($name)) {
            $query->where('name', 'like', "%{$name}%");
        }

        if (!empty($email)) {
            $query->where('email', 'like', "%{$email}%");
        }

        if (!empty($role) && $role !== 'Semua') {
            $query->where('role', $role);
        }

        if (!empty($registered)) {
            $query->whereDate('created_at', $registered);
        }

        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('Admin/User/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'name' => $name,
                'email' => $email,
                'role' => $role,
                'registered' => $registered,
            ]
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/User/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return redirect()->route('admin.users.index')->with('success', 'Akun pengguna berhasil dibuat.');
    }

    public function edit(User $user)
    {
        // Load daftar warga untuk bisa di-link ke akun
        $wargas = Warga::whereNull('user_id')
            ->orWhere('user_id', $user->id)
            ->orderBy('nama_lengkap')
            ->get(['id', 'nama_lengkap', 'user_id']);

        return Inertia::render('Admin/User/Edit', [
            'editUser' => $user,
            'wargas' => $wargas,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string',
        ];

        // If password is provided, validate it
        if ($request->filled('password')) {
            $rules['password'] = 'required|string|min:8|confirmed';
        }

        $validated = $request->validate($rules);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        // Link/unlink warga ke user ini
        $wargaId = $request->input('warga_id');
        
        // Unlink warga yang sebelumnya terhubung
        Warga::where('user_id', $user->id)->update(['user_id' => null]);

        // Link warga baru jika dipilih
        if ($wargaId) {
            Warga::where('id', $wargaId)->update(['user_id' => $user->id]);
        }

        return redirect()->route('admin.users.index')->with('success', 'Akun pengguna berhasil diperbarui.');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->route('admin.users.index')->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'Akun pengguna berhasil dihapus.');
    }
}
