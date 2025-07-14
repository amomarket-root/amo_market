<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WelcomeEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $provider;

    public function __construct(User $user, string $provider)
    {
        $this->user = $user;
        $this->provider = $provider;
    }

    public function build()
    {
        return $this->subject('Welcome to Amo Market')
            ->view('emails.welcome')
            ->with([
                'user' => $this->user,
                'provider' => $this->provider
            ]);
    }
}
