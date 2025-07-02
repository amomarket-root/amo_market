<?php

namespace App\Events;

use App\Models\SupportMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageSent implements ShouldBroadcast
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public $message;

    public function __construct(SupportMessage $message)
    {
        $this->message = $message;
    }

    public function broadcastOn()
    {
        return new Channel('support_chat.'.$this->message->receiver_id);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}
