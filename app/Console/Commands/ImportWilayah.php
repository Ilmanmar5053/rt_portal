<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

#[Signature('app:import-wilayah')]
#[Description('Import wilayah data from /tmp/wilayah/db/wilayah.sql')]
class ImportWilayah extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $path = '/tmp/wilayah/db/wilayah.sql';
        
        if (!File::exists($path)) {
            $this->error("File not found: {$path}. Please make sure you have cloned cahyadsn/wilayah into /tmp/wilayah.");
            return Command::FAILURE;
        }

        $this->info("Found wilayah.sql. Emptying table if exists...");
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('wilayah')->truncate();

        $this->info("Importing data... This might take a few moments.");
        $sql = File::get($path);
        
        DB::unprepared($sql);
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $count = DB::table('wilayah')->count();
        $this->info("Successfully imported {$count} regions into the database!");
        
        return Command::SUCCESS;
    }
}
