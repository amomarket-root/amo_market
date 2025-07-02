<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id')->nullable();
            $table->string('social_media_id')->nullable();
            $table->uuid('avatar_id')->nullable();
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('number')->unique()->nullable();
            $table->timestamp('number_verified_at')->nullable();
            $table->string('otp')->nullable();
            $table->timestamp('otp_expiry')->nullable();
            $table->timestamp('login_time')->nullable();
            $table->timestamp('logout_time')->nullable();
            $table->boolean('has_entered_details')->default(false);
            $table->tinyInteger('status');
            $table->rememberToken();
            $table->timestamps();

            // Adding foreign key constraints for role_id and avatar_id
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('cascade');
            $table->foreign('avatar_id')->references('id')->on('avatars')->onDelete('set null');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->index();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
