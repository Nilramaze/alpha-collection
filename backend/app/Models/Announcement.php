<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'title', 'text', 'image_url', 'gallery_images',
        'title_size', 'text_size', 'background_color',
        'enabled', 'sort_order',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'enabled'        => 'boolean',
    ];
}
