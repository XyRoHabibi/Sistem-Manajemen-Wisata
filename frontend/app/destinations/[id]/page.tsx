"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const MapContainer = dynamic<any>(() => import("react-leaflet").then(m => m.MapContainer as any), { ssr: false });
const TileLayer = dynamic<any>(() => import("react-leaflet").then(m => m.TileLayer as any), { ssr: false });
const Marker = dynamic<any>(() => import("react-leaflet").then(m => m.Marker as any), { ssr: false });

const API = process.env.NEXT_PUBLIC_API_URL as string;

type Review = {
	id: number;
	author_name: string;
	rating: number | string;
	comment?: string;
	created_at: string;
};

type Destination = {
	id: number;
	name: string;
	location: string; // we will parse as "lat,lng" or plain text
	description?: string;
	rating: number | string;
	price_range?: string;
	image_url?: string;
	reviews?: Review[];
};

export default function DestinationDetailPage() {
	const params = useParams();
	const id = params?.id as string;
	const [destination, setDestination] = useState<Destination | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [form, setForm] = useState({ author_name: "", rating: 5, comment: "" });

	useEffect(() => {
		if (id) {
			load();
			loadReviews();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	async function load() {
		const res = await axios.get<Destination>(`${API}/destinations/${id}`);
		setDestination(res.data);
	}

	async function loadReviews() {
		const res = await axios.get<{ data: Review[] }>(`${API}/destinations/${id}/reviews`);
		setReviews(res.data.data);
	}

	async function submitReview() {
		await axios.post(`${API}/destinations/${id}/reviews`, form);
		setForm({ author_name: "", rating: 5, comment: "" });
		await Promise.all([load(), loadReviews()]);
	}

	function formatRating(value: number | string | undefined) {
		const n = Number(value ?? 0);
		return isFinite(n) ? n.toFixed(2) : "0.00";
	}

	let lat: number | null = null;
	let lng: number | null = null;
	if (destination?.location && destination.location.includes(",")) {
		const [a, b] = destination.location.split(",").map((v) => parseFloat(v.trim()));
		if (!Number.isNaN(a) && !Number.isNaN(b)) {
			lat = a; lng = b;
		}
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			{destination && (
				<>
					<h1 className="mb-2 text-3xl font-bold">{destination.name}</h1>
					<p className="text-gray-600">{destination.location}</p>
					<p className="mt-2">Rating rata-rata: {formatRating(destination.rating)}</p>
					{destination.image_url && (
						<img src={destination.image_url} alt={destination.name} className="mt-4 w-full rounded object-cover" />
					)}
					<p className="mt-4 whitespace-pre-line">{destination.description}</p>
					<p className="mt-2">Harga: {destination.price_range ?? '-'}</p>

					<div className="mt-6">
						<h2 className="mb-2 text-xl font-semibold">Peta Lokasi</h2>
						<div className="h-64 overflow-hidden rounded border">
							{lat !== null && lng !== null ? (
								<MapContainer center={[lat, lng] as any} zoom={13} style={{ height: "100%", width: "100%" }}>
									<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
									<Marker position={[lat, lng] as any} />
								</MapContainer>
							) : (
								<div className="flex h-full items-center justify-center text-sm text-gray-500">
									Format lokasi bukan koordinat. Isi sebagai "lat,lng" untuk tampil di peta.
								</div>
							)}
						</div>
					</div>

					<div className="mt-8">
						<h2 className="mb-2 text-xl font-semibold">Tulis Ulasan</h2>
						<div className="space-y-3">
							<input
								value={form.author_name}
								onChange={(e) => setForm({ ...form, author_name: e.target.value })}
								placeholder="Nama Anda"
								className="w-full rounded border px-3 py-2"
							/>
							<select
								value={form.rating}
								onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
								className="w-40 rounded border px-3 py-2"
							>
								{[1,2,3,4,5].map((n) => (
									<option key={n} value={n}>{n}</option>
								))}
							</select>
							<textarea
								value={form.comment}
								onChange={(e) => setForm({ ...form, comment: e.target.value })}
								placeholder="Komentar"
								className="h-28 w-full rounded border px-3 py-2"
							/>
							<button onClick={submitReview} className="rounded bg-blue-600 px-4 py-2 text-white">
								Kirim Ulasan
							</button>
						</div>

						<h2 className="mt-8 mb-2 text-xl font-semibold">Ulasan Pengunjung</h2>
						<div className="space-y-4">
							{reviews.map((r) => (
								<div key={r.id} className="rounded border p-3">
									<p className="font-medium">{r.author_name} — {formatRating(r.rating)}/5</p>
									<p className="text-sm text-gray-700">{r.comment}</p>
									<p className="text-xs text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
								</div>
							))}
							{reviews.length === 0 && <div className="text-sm text-gray-500">Belum ada ulasan</div>}
						</div>
					</div>
				</>
			)}
		</div>
	);
} 