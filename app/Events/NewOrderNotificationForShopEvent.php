<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderNotificationForShopEvent implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public $notification;

    public function __construct($notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn()
    {
        return new Channel('notification_for_shop.'.$this->notification['shop_id']);
    }

    public function broadcastAs()
    {
        return 'new.order.notification';
    }

    public function broadcastWith()
    {
        return [
            'id'           => $this->notification['id'],
            'order_id'     => $this->notification['order_id'],
            'total_amount' => $this->notification['total_amount'],
            'message'      => $this->notification['message'],
        ];
    }
}
