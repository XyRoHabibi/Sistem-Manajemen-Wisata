"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type Destination = {
	id: number;
	name: string;
	location: string;
	description?: string;
	rating: number | string;
	price_range?: string;
	image_url?: string;
};

type Paginated<T> = {
	data: T[];
	current_page: number;
	total: number;
	per_page: number;
};

const API = process.env.NEXT_PUBLIC_API_URL as string;

export default function HomePage() {
	const [items, setItems] = useState<Destination[]>([]);
	const [q, setQ] = useState("");
	const [minRating, setMinRating] = useState<string>("");

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	async function load(params?: { q?: string; minRating?: string }) {
		const res = await axios.get<Paginated<Destination>>(`${API}/destinations`, {
			params,
		});
		setItems(res.data.data);
	}

	function formatRating(value: number | string | undefined) {
		const n = Number(value ?? 0);
		return isFinite(n) ? n.toFixed(2) : "0.00";
	}

	return (
		<div className="mx-auto max-w-6xl p-6">
			<header className="mb-6 flex items-center justify-between">
				<h1 className="text-2xl font-bold">Katalog Destinasi Wisata</h1>
				<Link href="/destinations/new" className="rounded bg-blue-600 px-4 py-2 text-white">
					Tambah Destinasi
				</Link>
			</header>

			<div className="mb-6 flex gap-3">
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Cari nama atau lokasi"
					className="w-full rounded border px-3 py-2"
				/>
				<input
					value={minRating}
					onChange={(e) => setMinRating(e.target.value)}
					placeholder="Min Rating (1-5)"
					type="number"
					min={1}
					max={5}
					className="w-48 rounded border px-3 py-2"
				/>
				<button
					onClick={() => load({ q, minRating })}
					className="rounded bg-gray-900 px-4 py-2 text-white"
				>
					Filter
				</button>
			</div>

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{items.map((d) => (
					<Link key={d.id} href={`/destinations/${d.id}`} className="rounded border shadow">
						{d.image_url ? (
							<img src={d.image_url} alt={d.name} className="h-48 w-full rounded-t object-cover" />
						) : (
							<div className="flex h-48 items-center justify-center bg-gray-100">No Image</div>
						)}
						<div className="p-4">
							<h3 className="text-lg font-semibold">{d.name}</h3>
							<p className="text-sm text-gray-600">{d.location}</p>
							<p className="mt-2 line-clamp-2 text-sm">{d.description}</p>
							<p className="mt-2 text-sm">Rating: {formatRating(d.rating)}</p>
							<p className="text-sm">Harga: {d.price_range ?? '-'}</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
