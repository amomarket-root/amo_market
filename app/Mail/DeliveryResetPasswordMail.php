<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DeliveryResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $token;

    /**
     * Create a new message instance.
     *
     * @param string $token
     */
    public function __construct($token)
    {
        $this->token = $token;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Reset Your Password')
            ->view('emails.reset_password')
            ->with([
                'token' => $this->token,
                'reset_url' => $this->generateResetUrl($this->token),
            ]);
    }

    /**
     * Generate the reset password URL.
     *
     * @param string $token
     * @return string
     */
    private function generateResetUrl($token)
    {
        return config('app.url') . '/delivery/reset_password?token=' . $token;
    }
}
