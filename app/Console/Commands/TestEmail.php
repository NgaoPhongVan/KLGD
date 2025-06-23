<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Notifications\CustomResetPasswordNotification;
use App\Models\User;

class TestEmail extends Command
{
    protected $signature = 'email:test {email}';
    protected $description = 'Test email configuration by sending a test email';

    public function handle()
    {
        $email = $this->argument('email');
        
        try {
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                $this->error("User with email {$email} not found!");
                return 1;
            }

            $user->notify(new CustomResetPasswordNotification('test-token-123'));
            
            $this->info("Test email sent successfully to {$email}");
            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to send email: " . $e->getMessage());
            return 1;
        }
    }
}
