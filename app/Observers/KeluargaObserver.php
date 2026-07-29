<?php

namespace App\Observers;

use App\Models\Keluarga;
use App\Models\RumahBlok;

class KeluargaObserver
{
    /**
     * Handle the Keluarga "created" event.
     */
    public function created(Keluarga $keluarga): void
    {
        if ($keluarga->rumah_blok_id) {
            $this->updateRumahStatus($keluarga->rumah_blok_id);
        }
    }

    /**
     * Handle the Keluarga "updated" event.
     */
    public function updated(Keluarga $keluarga): void
    {
        // If rumah_blok_id was changed, update both the old and new RumahBlok
        if ($keluarga->isDirty('rumah_blok_id')) {
            $oldRumahId = $keluarga->getOriginal('rumah_blok_id');
            if ($oldRumahId) {
                $this->updateRumahStatus($oldRumahId);
            }
            if ($keluarga->rumah_blok_id) {
                $this->updateRumahStatus($keluarga->rumah_blok_id);
            }
        }
    }

    /**
     * Handle the Keluarga "deleted" event.
     */
    public function deleted(Keluarga $keluarga): void
    {
        if ($keluarga->rumah_blok_id) {
            $this->updateRumahStatus($keluarga->rumah_blok_id);
        }
    }

    private function updateRumahStatus($rumahBlokId)
    {
        $rumah = RumahBlok::find($rumahBlokId);
        if ($rumah) {
            $count = Keluarga::where('rumah_blok_id', $rumahBlokId)->count();
            $status = $count > 0 ? 'Diisi' : 'Kosong';
            
            if ($rumah->status_hunian !== $status) {
                $rumah->update(['status_hunian' => $status]);
            }
        }
    }
}
