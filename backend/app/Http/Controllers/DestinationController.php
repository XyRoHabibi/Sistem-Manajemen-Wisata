<?php

namespace App\Http\Controllers;

use App\Models\Destination;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class DestinationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Destination::query()->withCount('reviews');

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($minRating = $request->query('minRating')) {
            $query->where('rating', '>=', (float) $minRating);
        }

        $destinations = $query->orderByDesc('id')->paginate(12);

        // Ensure image_url is absolute
        $destinations->getCollection()->transform(function ($d) {
            if ($d->image_url && str_starts_with($d->image_url, '/')) {
                $d->image_url = url($d->image_url);
            }
            return $d;
        });

        return response()->json($destinations);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_range' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $imageUrl = url(Storage::disk('public')->url($path));
        }

        $destination = Destination::create([
            'name' => $validated['name'],
            'location' => $validated['location'],
            'description' => $validated['description'] ?? null,
            'price_range' => $validated['price_range'] ?? null,
            'image_url' => $imageUrl,
            'rating' => 0,
        ]);

        return response()->json($destination, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Destination $destination)
    {
        $destination->load(['reviews' => function ($q) { $q->latest(); }]);
        if ($destination->image_url && str_starts_with($destination->image_url, '/')) {
            $destination->image_url = url($destination->image_url);
        }
        return response()->json($destination);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Destination $destination)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Destination $destination)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'location' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_range' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('destinations', 'public');
            $destination->image_url = url(Storage::disk('public')->url($path));
        }

        $destination->fill($validated);
        $destination->save();

        if ($destination->image_url && str_starts_with($destination->image_url, '/')) {
            $destination->image_url = url($destination->image_url);
        }

        return response()->json($destination);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Destination $destination)
    {
        $destination->delete();
        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Add a review to a destination.
     */
    public function addReview(Request $request, Destination $destination)
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', Rule::in([1,2,3,4,5])],
            'comment' => ['nullable', 'string'],
        ]);

        $review = new Review($validated);
        $destination->reviews()->save($review);

        // Recalculate average rating
        $avg = round($destination->reviews()->avg('rating'), 2);
        $destination->rating = $avg;
        $destination->save();

        return response()->json($review, 201);
    }

    /**
     * List reviews for a destination.
     */
    public function listReviews(Destination $destination)
    {
        return response()->json(
            $destination->reviews()->latest()->paginate(10)
        );
    }
}
