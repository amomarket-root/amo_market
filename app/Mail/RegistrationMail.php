<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RegistrationMail extends Mailable
{
    use Queueable;
    use SerializesModels;

    public $email;

    public $maskedPassword;

    /**
     * Create a new message instance.
     *
     * @param  string  $email
     * @param  string  $maskedPassword
     */
    public function __construct($email, $maskedPassword)
    {
        $this->email          = $email;
        $this->maskedPassword = $maskedPassword;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Registration Successful')
            ->view('emails.registration') // Blade template for the email
            ->with([
                'email'          => $this->email,
                'maskedPassword' => $this->maskedPassword,
            ]);
    }
}
