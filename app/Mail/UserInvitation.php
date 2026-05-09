<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UserInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly User $user,
        public readonly string $token
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'You are invited to join SARAH',
        );
    }

    public function content(): Content
    {
        $inviteUrl = config('app.url') . '/accept-invitation/' . $this->token;

        return new Content(
            view: 'emails.user-invitation',
            with: [
                'user' => $this->user,
                'inviteUrl' => $inviteUrl,
            ],
        );
    }
}