<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['name', 'email', 'password', 'role', 'last_login_at', 'last_activity_at', 'last_ip_address', 'last_browser', 'last_module'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
            'last_activity_at' => 'datetime',
        ];
    }

    public function warga(): HasOne
    {
        return $this->hasOne(Warga::class);
    }

    public function isSuperadmin(): bool { return $this->role === 'superadmin'; }
    public function isRW(): bool { return $this->role === 'rw'; }
    public function isRT(): bool { return $this->role === 'rt'; }
    public function isBendahara(): bool { return $this->role === 'bendahara'; }
    public function isSekretaris(): bool { return $this->role === 'sekretaris'; }
    public function isWargaKK(): bool { return $this->role === 'warga_kk'; }
}
