"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL as string;

export default function NewDestinationPage() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(formData: FormData) {
		setSubmitting(true);
		setError(null);
		try {
			await axios.post(`${API}/destinations`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			router.push("/");
		} catch (e: any) {
			setError(e?.response?.data?.message || "Gagal menyimpan");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="mx-auto max-w-2xl p-6">
			<h1 className="mb-4 text-2xl font-semibold">Tambah Destinasi</h1>
			{error && <div className="mb-3 rounded bg-red-100 p-2 text-red-800">{error}</div>}
			<form
				action={(data) => handleSubmit(data)}
				className="space-y-4"
			>
				<div>
					<label className="mb-1 block text-sm">Nama</label>
					<input name="name" required className="w-full rounded border px-3 py-2" />
				</div>
				<div>
					<label className="mb-1 block text-sm">Lokasi</label>
					<input name="location" required className="w-full rounded border px-3 py-2" />
				</div>
				<div>
					<label className="mb-1 block text-sm">Deskripsi</label>
					<textarea name="description" className="h-28 w-full rounded border px-3 py-2" />
				</div>
				<div>
					<label className="mb-1 block text-sm">Rentang Harga</label>
					<input name="price_range" className="w-full rounded border px-3 py-2" />
				</div>
				<div>
					<label className="mb-1 block text-sm">Gambar</label>
					<input name="image" type="file" accept="image/*" className="w-full rounded border px-3 py-2" />
				</div>
				<button disabled={submitting} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
					{submitting ? "Menyimpan..." : "Simpan"}
				</button>
			</form>
		</div>
	);
} 