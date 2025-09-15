<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'description',
        'rating',
        'price_range',
        'image_url',
    ];

    /**
     * Get the reviews for the destination.
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }
}
