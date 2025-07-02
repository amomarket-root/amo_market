<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotificationForShop extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     *
     * @param  mixed  $order
     */
    public function __construct($order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via($notifiable)
    {
        return ['mail', 'database']; // Database for API, Mail for emails
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('New Order Received')
            ->view('emails.new_order_shop', [
                'notifiable' => $notifiable,
                'order'      => $this->order,
            ]);
    }

    /**
     * Get the array representation of the notification for database storage.
     */
    public function toArray($notifiable)
    {
        return [
            'order_id'     => $this->order->id           ?? null,
            'total_amount' => $this->order->total_amount ?? null,
            'message'      => 'You have received a new order!',
        ];
    }

    /**
     * Generate the new order URL.
     *
     * @param  int|string|null  $id
     * @return string
     */
    public function newOrderUrl($id)
    {
        return config('app.url').'/shop/order-details/'.$id;
    }

    /**
     * Save the notification data into the shop_notifications table.
     *
     * @param  object  $notifiable
     */
    public function toDatabase($notifiable)
    {
        return [
            'shop_id'      => $notifiable->id,
            'order_id'     => $this->order->id,
            'total_amount' => $this->order->total_amount,
            'is_read'      => false,
        ];
    }
}
