<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileHandlerService
{
    // Generate a unique file name
    public function generateNameFile()
    {
        return md5(microtime());
    }

    // Save file with random name
    public function saveFileToStorage($file, $path)
    {
        $fileName   = $this->generateNameFile().'.'.$file->getClientOriginalExtension();
        $storedPath = $file->storeAs($path, $fileName, 'public');

        // Return full public URL
        return asset('storage/'.$storedPath);
    }

    // Save file with a specific name
    public function saveFileWithNameToStorage($file, $path, $fileName)
    {
        $storedPath = $file->storeAs($path, $fileName, 'public');

        // Return full public URL
        return asset('storage/'.$storedPath);
    }

    // Delete file using its public URL
    public function deleteFileFromStorage($fileUrl)
    {
        $publicUrlPrefix = config('app.url').'/storage/';
        $relativePath    = str_replace($publicUrlPrefix, '', $fileUrl);

        if (Storage::disk('public')->exists($relativePath)) {
            return Storage::disk('public')->delete($relativePath);
        }

        return false;
    }

    // Delete a directory
    public function deleteItemDirectory($directoryPath)
    {
        if (Storage::disk('public')->exists($directoryPath)) {
            return Storage::disk('public')->deleteDirectory($directoryPath);
        }

        return false;
    }

    public function deleteProductItemDirectory($directoryPath)
    {
        return $this->deleteItemDirectory($directoryPath);
    }

    // Upload multiple files
    public function uploadFiles($files, $userId)
    {
        $uploadedUrls = [];

        foreach ($files as $file) {
            $extension  = $file->getClientOriginalExtension();
            $fileName   = Str::uuid().'.'.$extension;
            $storedPath = $file->storeAs("services/user_{$userId}", $fileName, 'public');

            $uploadedUrls[] = asset('storage/'.$storedPath);
        }

        return $uploadedUrls;
    }

    // Delete multiple files by path relative to the public disk
    public function deleteFiles($paths)
    {
        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }
}
