"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { callsApi } from "../lib/api";
import NewCallLogDialog from "../components/NewCallLogDialog";
import { useOverallCallStats } from "../hooks/useOverallCallStats";
import { extractArrayData, calculatePercentage, calculatePercentageRounded } from "../lib/utils";
import { CALL_TYPES, AGENT_TYPES, CALL_TYPE_LABELS, AGENT_TYPE_LABELS } from "../constants/callTypes";
import {
	FiCalendar,
	FiChevronDown,
	FiDownload,
	FiFilter,
	FiPlay,
	FiSearch,
	FiArrowUpRight,
	FiArrowDownLeft,
	FiAlertCircle,
} from "react-icons/fi";

function formatDuration(seconds) {
	if (!seconds) return "0s";
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function formatTime(timestamp) {
	if (!timestamp) return "N/A";
	try {
		const date = new Date(timestamp);
		if (isNaN(date.getTime())) return "N/A";
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return "N/A";
	}
}

function formatDateRange(date) {
	const today = new Date();
	if (date.toDateString() === today.toDateString()) {
		return `Today: ${date.toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		})}`;
	}
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

export default function CallsAndLogsPage() {
	const [activeMonitoring, setActiveMonitoring] = useState(true);
	const [calls, setCalls] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
	const { stats: overallStats } = useOverallCallStats();

	const [filters, setFilters] = useState({
		type: "",
		agent_type: "",
		start_date: "",
		end_date: "",
	});

	const [selectedDate] = useState(new Date());

	const fetchCalls = async (page = 1) => {
		setLoading(true);
		setError(null);
		try {
			const response = await callsApi.list({
				...filters,
				page,
				limit: 20,
			});

			console.log("Calls API Response:", response);
			const callsData = extractArrayData(response);
			const paginationData = response?.pagination || { page, limit: 20, total: 0, totalPages: 1 };

			setCalls(callsData);
			setPagination({
				page: paginationData.page || page,
				limit: paginationData.limit || 20,
				total: paginationData.total || 0,
				totalPages: paginationData.totalPages || 1,
			});
		} catch (err) {
			console.error("Error fetching calls:", err);
			setError(err.message);
			setCalls([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCalls(1);
	}, [filters, selectedDate]);

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const handleClearFilters = () => {
		setFilters({
			type: "",
			agent_type: "",
			start_date: "",
			end_date: "",
		});
	};

	const handlePreviousPage = () => {
		if (pagination.page > 1) {
			fetchCalls(pagination.page - 1);
		}
	};

	const handleNextPage = () => {
		if (pagination.page < pagination.totalPages) {
			fetchCalls(pagination.page + 1);
		}
	};

	return (
		<div className="min-h-screen bg-[#f5f8fb] text-slate-900">
			<div className="grid min-h-screen grid-cols-1 lg:grid-cols-[auto_1fr]">
				<Sidebar />
				<main className="flex flex-col gap-6 px-8 py-6">
					<Navbar
						activeMonitoring={activeMonitoring}
						onToggleMonitoring={setActiveMonitoring}
					/>

					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h1 className="text-xl font-semibold">Calls & Logs</h1>
							<p className="text-sm text-slate-500">
								Review communication history and AI activity logs.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5"
								disabled={loading || calls.length === 0}
							>
								<FiDownload className="mr-2" /> Export CSV
							</Button>
							<NewCallLogDialog onCallLogged={() => fetchCalls(1)} />
						</div>
					</div>

					<Card className="border-slate-100 shadow-sm">
						<CardContent className="space-y-4">
							<div className="flex flex-wrap items-center gap-3">
								<div className="relative flex w-full max-w-xs items-center">
									<FiSearch className="absolute left-3 text-slate-400" />
									<Input
										className="h-9 rounded-full border-slate-200 pl-9 text-sm"
										placeholder="Search logs, patients, or agents..."
									/>
								</div>
								<Button
									variant="outline"
									className="rounded-full text-xs"
									disabled={loading}
								>
									<FiCalendar className="mr-2" /> {formatDateRange(selectedDate)}
									<FiChevronDown className="ml-2" />
								</Button>
								<select
									value={filters.agent_type}
									onChange={(e) => handleFilterChange("agent_type", e.target.value)}
									className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 outline-none"
									disabled={loading}
								>
									<option value="">Agent: All</option>
									<option value={AGENT_TYPES.AI}>Agent: {AGENT_TYPE_LABELS[AGENT_TYPES.AI]}</option>
									<option value={AGENT_TYPES.HUMAN}>Agent: {AGENT_TYPE_LABELS[AGENT_TYPES.HUMAN]}</option>
								</select>
								<select
									value={filters.type}
									onChange={(e) => handleFilterChange("type", e.target.value)}
									className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 outline-none"
									disabled={loading}
								>
									<option value="">Call Type: All</option>
									<option value={CALL_TYPES.INCOMING}>{CALL_TYPE_LABELS[CALL_TYPES.INCOMING]}</option>
									<option value={CALL_TYPES.OUTGOING}>{CALL_TYPE_LABELS[CALL_TYPES.OUTGOING]}</option>
								</select>
								<Button
									variant="ghost"
									className="rounded-full text-xs"
									onClick={handleClearFilters}
									disabled={loading}
								>
									<FiFilter className="mr-2" /> Clear Filters
								</Button>
							</div>
						</CardContent>
					</Card>

					{error && (
						<Card className="border-red-200 bg-red-50 shadow-sm">
							<CardContent className="flex items-center gap-2 text-sm text-red-700 py-3">
								<FiAlertCircle className="flex-shrink-0" />
								{error}
							</CardContent>
						</Card>
					)}

					<div className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
						<Card className="border-slate-100 shadow-sm">
							<CardHeader>
								<div className="grid grid-cols-[90px_1.2fr_1fr_1fr_1.5fr_120px] text-[11px] uppercase tracking-[0.2em] text-slate-400">
									<span>Time & Type</span>
									<span>Caller</span>
									<span>Agent</span>
									<span>Duration</span>
									<span>AI Summary & Action</span>
									<span>Recording</span>
								</div>
							</CardHeader>
							<CardContent className="space-y-3">
								{loading ? (
									<div className="flex items-center justify-center py-8 text-slate-500">
										Loading calls...
									</div>
								) : calls.length === 0 ? (
									<div className="flex items-center justify-center py-8 text-slate-500">
										No calls found
									</div>
								) : (
									calls.map((call) => (
										<div
											key={call.id}
											className={`grid grid-cols-[90px_1.2fr_1fr_1fr_1.5fr_120px] items-center gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow ${
												call.type === "incoming"
													? "border-l-2 border-l-[var(--brand-primary)]"
													: "border-l-2 border-l-slate-300"
											}`}
										>
											<div className="text-xs font-semibold">
												{formatTime(call.time).split(" ")[0]}
												<span className="block text-[10px] text-slate-400">
													{formatTime(call.time).split(" ")[1]}
												</span>
												<div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
													{call.type === CALL_TYPES.INCOMING ? (
														<FiArrowDownLeft className="text-emerald-500" />
													) : (
														<FiArrowUpRight className="text-slate-500" />
													)}
													{CALL_TYPE_LABELS[call.type] || "Unknown"}
												</div>
											</div>
											<div>
												<p className="font-semibold text-slate-800">{call.caller}</p>
												<p className="text-xs text-slate-400">{call.caller}</p>
											</div>
											<div>
												<Badge variant="info" className="text-[9px]">
													{AGENT_TYPE_LABELS[call.agent_type] || "Unknown"}
												</Badge>
											</div>
											<div className="text-xs text-slate-500">{formatDuration(call.duration)}</div>
											<div>
												{call.ai_summary ? (
													<p className="text-xs text-slate-500 line-clamp-2">"{call.ai_summary}"</p>
												) : (
													<p className="text-xs text-slate-400">No summary</p>
												)}
												<Badge
													variant="info"
													className="mt-2 text-[9px]"
												>
													Call Logged
												</Badge>
											</div>
											<div className="flex items-center justify-end">
												{call.recording ? (
													<Button variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
														<FiPlay className="text-slate-600" />
													</Button>
												) : (
													<span className="text-xs text-slate-400">No recording</span>
												)}
											</div>
										</div>
									))
								)}
								<div className="flex items-center justify-between pt-2 text-xs text-slate-500">
									<span>
										Showing {calls.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}-
										{Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
										{pagination.total} results
									</span>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											className="rounded-full px-3"
											onClick={handlePreviousPage}
											disabled={loading || pagination.page === 1}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="rounded-full px-3"
											onClick={handleNextPage}
											disabled={loading || pagination.page >= pagination.totalPages}
										>
											Next
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						<div className="flex flex-col gap-6">
							<Card className="border-slate-100 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-50/30">
								<CardHeader>
									<CardTitle className="text-emerald-900">Overall Agent Calls</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<div className="text-3xl font-semibold text-emerald-900">
												{overallStats?.ai_calls || 0}
											</div>
											<p className="text-xs text-emerald-600 mt-1">Total calls handled by Agent</p>
										</div>
										<div className="pt-3 border-t border-emerald-200">
											<div className="flex items-center justify-between text-xs text-emerald-700 mb-2">
												<span>Agent vs Staff</span>
												<span>
													{overallStats && overallStats.total_calls > 0
														? `${calculatePercentage(overallStats.ai_calls, overallStats.total_calls)}% vs ${calculatePercentage(overallStats.human_calls, overallStats.total_calls)}%`
														: "—"}
												</span>
											</div>
											<div className="flex gap-2">
												<div className="flex-1 h-2 rounded-full bg-emerald-200">
													<div
														className="h-2 rounded-full bg-emerald-600"
														style={{
															width: overallStats?.total_calls
																? `${calculatePercentageRounded(overallStats.ai_calls, overallStats.total_calls)}%`
																: "0%",
														}}
													/>
												</div>
												<div className="flex-1 h-2 rounded-full bg-slate-200">
													<div
														className="h-2 rounded-full bg-slate-600"
														style={{
															width: overallStats?.total_calls
																? `${calculatePercentageRounded(overallStats.human_calls, overallStats.total_calls)}%`
																: "0%",
														}}
													/>
												</div>
											</div>
										</div>
										<div className="pt-2 text-xs text-slate-500">
											<p>Total Calls: <strong>{overallStats?.total_calls || 0}</strong></p>
											<p>Staff Calls: <strong>{overallStats?.human_calls || 0}</strong></p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
