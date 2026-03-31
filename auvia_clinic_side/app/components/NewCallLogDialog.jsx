"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { callsApi } from "../lib/api";
import { CALL_TYPES, AGENT_TYPES, CALL_TYPE_LABELS, AGENT_TYPE_LABELS } from "../constants/callTypes";

export default function NewCallLogDialog({ onCallLogged, className }) {
	const INITIAL_FORM = {
		type: CALL_TYPES.INCOMING,
		agent_type: AGENT_TYPES.AI,
		caller: "",
		duration: 0,
		ai_summary: "",
	};

	const [open, setOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const [form, setForm] = useState(INITIAL_FORM);

	function set(field, value) {
		setForm((f) => ({ ...f, [field]: value }));
	}

	async function handleSubmit() {
		setSubmitting(true);
		setError(null);
		try {
			await callsApi.create({
				type: form.type,
				caller: form.caller,
				agent_type: form.agent_type,
				duration: parseInt(form.duration) || 0,
				ai_summary: form.ai_summary,
			});
			setSuccess(true);
			onCallLogged?.();
			setTimeout(() => {
				setOpen(false);
				setSuccess(false);
				setStep(1);
				setForm(INITIAL_FORM);
			}, 1800);
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	}

	function resetAndClose() {
		setOpen(false);
		setStep(1);
		setError(null);
		setSuccess(false);
	}

	if (!open) {
		return (
			<Button
				onClick={() => setOpen(true)}
				className={`rounded-full px-4 bg-emerald-600 text-white hover:bg-emerald-700 gap-2 ${className}`}
			>
				<Plus className="h-4 w-4" />
				Log Manual Call
			</Button>
		);
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
			<div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
				{/* Header */}
				<div className="px-6 pt-6 pb-4 border-b border-slate-100">
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold text-slate-900">
							{step === 1 && "Call Details"}
							{step === 2 && "Confirm Call Log"}
						</h2>
						<button
							onClick={resetAndClose}
							className="text-slate-400 hover:text-slate-600 text-xl leading-none"
						>
							×
						</button>
					</div>
					<div className="flex gap-1 mt-3">
						{[1, 2].map((s) => (
							<div
								key={s}
								className={`h-1 flex-1 rounded-full transition-colors ${
									s <= step ? "bg-emerald-500" : "bg-slate-100"
								}`}
							/>
						))}
					</div>
				</div>

				<div className="px-6 py-5">
					{/* ── Step 1 ── */}
					{step === 1 && (
						<div className="space-y-4">
							<div>
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Call Type
								</label>
								<select
									value={form.type}
									onChange={(e) => set("type", e.target.value)}
									className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
								>
									<option value={CALL_TYPES.INCOMING}>{CALL_TYPE_LABELS[CALL_TYPES.INCOMING]}</option>
									<option value={CALL_TYPES.OUTGOING}>{CALL_TYPE_LABELS[CALL_TYPES.OUTGOING]}</option>
								</select>
							</div>

							<div>
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Agent Type
								</label>
								<select
									value={form.agent_type}
									onChange={(e) => set("agent_type", e.target.value)}
									className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white"
								>
									<option value={AGENT_TYPES.AI}>{AGENT_TYPE_LABELS[AGENT_TYPES.AI]}</option>
									<option value={AGENT_TYPES.HUMAN}>{AGENT_TYPE_LABELS[AGENT_TYPES.HUMAN]}</option>
								</select>
							</div>

							<div>
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Caller Phone *
								</label>
								<input
									type="tel"
									value={form.caller}
									onChange={(e) => set("caller", e.target.value)}
									placeholder="9876543210"
									className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Duration (seconds) *
								</label>
								<input
									type="number"
									value={form.duration}
									onChange={(e) => set("duration", e.target.value)}
									placeholder="0"
									min="0"
									className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
									Call Summary (optional)
								</label>
								<textarea
									value={form.ai_summary}
									onChange={(e) => set("ai_summary", e.target.value)}
									placeholder="Brief summary of the call"
									rows={2}
									className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
								/>
							</div>

							<Button
								className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
								disabled={!form.caller || form.duration === ""}
								onClick={() => setStep(2)}
							>
								Next: Review
							</Button>
						</div>
					)}

					{/* ── Step 2 ── */}
					{step === 2 && (
						<div className="space-y-4">
							{success ? (
								<div className="text-center py-8">
									<div className="text-4xl mb-3">✅</div>
									<p className="font-semibold text-emerald-700">Call Logged!</p>
								</div>
							) : (
								<>
									<div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
										<Row
											label="Call Type"
											value={CALL_TYPE_LABELS[form.type] || "Unknown"}
										/>
										<Row
											label="Agent Type"
											value={AGENT_TYPE_LABELS[form.agent_type] || "Unknown"}
										/>
										<Row label="Caller" value={form.caller} />
										<Row
											label="Duration"
											value={`${form.duration} seconds`}
										/>
										{form.ai_summary && (
											<Row label="Summary" value={form.ai_summary} />
										)}
									</div>

									{error && (
										<p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
											{error}
										</p>
									)}

									<Button
										className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 gap-2"
										onClick={handleSubmit}
										disabled={submitting}
									>
										{submitting && <Loader2 className="h-4 w-4 animate-spin" />}
										{submitting ? "Logging..." : "Confirm & Save"}
									</Button>
									<Button
										variant="ghost"
										className="w-full text-slate-500"
										onClick={() => setStep(1)}
										disabled={submitting}
									>
										← Edit Details
									</Button>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function Row({ label, value }) {
	return (
		<div className="flex justify-between">
			<span className="text-slate-500">{label}</span>
			<span className="font-medium text-slate-800 text-right max-w-[60%] break-words">
				{value}
			</span>
		</div>
	);
}
