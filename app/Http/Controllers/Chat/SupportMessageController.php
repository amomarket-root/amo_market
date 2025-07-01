<?php

namespace App\Http\Controllers\Chat;

use App\Events\SupportMessageSent;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\SupportMessage;
use Illuminate\Http\Request;
use App\Models\User;


class SupportMessageController extends Controller
{
   public function customerSendMessage(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|string',
            'message' => 'required|string',
            'type' => 'required|string',
        ]);

        if ($request->receiver_id === 'super-admin') {
            // Get all users with role "Admin" or "Super Admin" and status = 1
            $admins = User::whereHas('role', function ($query) {
                $query->whereIn('name', ['Admin', 'Super Admin']);
            })->where('status', 1)->inRandomOrder()->first();

            if (!$admins) {
                return response()->json(['error' => 'No eligible Admin or Super Admin found'], 404);
            }

            $receiverId = $admins->id; // Assign randomly selected Admin or Super Admin user
        } else {
            $receiverId = $request->receiver_id;
        }

        $message = SupportMessage::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $receiverId,
            'message' => $request->message,
            'type' => $request->type,
        ]);

        // Broadcast the message to the receiver
        broadcast(new SupportMessageSent($message))->toOthers();

        return response()->json(['message' => 'Message sent successfully', 'data' => $message], 201);
    }

    // Get messages for the authenticated user
    public function customerGetMessages()
    {
        $userId = Auth::id();

        $messages = SupportMessage::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['messages' => $messages], 200);
    }
}
