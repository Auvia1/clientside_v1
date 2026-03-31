"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { callsApi } from "../lib/api";
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
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

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
			const callsData = Array.isArray(response) ? response : response?.data || [];
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

	const fetchStats = async () => {
		try {
			const today = new Date().toISOString().split("T")[0];
			const response = await callsApi.getStats({
				start_date: today,
				end_date: today,
			});
			console.log("Calls Stats Response:", response);
			const statsData = response?.data || response || null;
			setStats(statsData);
		} catch (err) {
			console.error("Error fetching stats:", err);
			setStats(null);
		}
	};

	useEffect(() => {
		fetchCalls(1);
		fetchStats();
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
							<Button className="rounded-full px-4 transition-transform duration-200 hover:-translate-y-0.5">
								+ Log Manual Call
							</Button>
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
									<option value="ai">Agent: AI</option>
									<option value="human">Agent: Human</option>
								</select>
								<select
									value={filters.type}
									onChange={(e) => handleFilterChange("type", e.target.value)}
									className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 outline-none"
									disabled={loading}
								>
									<option value="">Call Type: All</option>
									<option value="incoming">Incoming</option>
									<option value="outgoing">Outgoing</option>
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
													{call.type === "incoming" ? (
														<FiArrowDownLeft className="text-emerald-500" />
													) : (
														<FiArrowUpRight className="text-slate-500" />
													)}
													{call.type === "incoming" ? "Incoming" : "Outgoing"}
												</div>
											</div>
											<div>
												<p className="font-semibold text-slate-800">{call.caller}</p>
												<p className="text-xs text-slate-400">{call.caller}</p>
											</div>
											<div>
												<Badge variant="info" className="text-[9px]">
													{call.agent_type === "ai" ? "Virtual Agent" : "Human Staff"}
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
							<Card className="border-slate-100 shadow-sm">
								<CardHeader className="flex flex-row items-center justify-between">
									<CardTitle>Total Today</CardTitle>
									{stats && (
										<Badge variant="success">
											{stats.total_calls > 0
												? `${((stats.ai_calls / stats.total_calls) * 100).toFixed(1)}% AI Handled`
												: "No calls"}
										</Badge>
									)}
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-semibold">{stats?.total_calls || 0}</div>
									<p className="text-xs text-slate-500">Calls Handled</p>
								</CardContent>
							</Card>

							<Card className="border-slate-100 shadow-sm">
								<CardHeader>
									<CardTitle>Daily Handling Efficiency</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-3">
										<div>
											<div className="flex items-center justify-between text-xs text-slate-500">
												<span>Virtual Agent Workload</span>
												<span>
													{stats
														? `${stats.total_calls > 0
															? Math.round((stats.ai_calls / stats.total_calls) * 100)
															: 0}% (${stats.ai_calls} Calls)`
														: "0% (0 Calls)"}
												</span>
											</div>
											<div className="mt-2 h-2 rounded-full bg-slate-100">
												<div
													className="h-2 rounded-full bg-[var(--brand-primary)]"
													style={{
														width: stats?.total_calls
															? `${(stats.ai_calls / stats.total_calls) * 100}%`
															: "0%",
													}}
												/>
											</div>
										</div>
										<div>
											<div className="flex items-center justify-between text-xs text-slate-500">
												<span>Human Staff Intervention</span>
												<span>
													{stats
														? `${stats.total_calls > 0
															? Math.round((stats.human_calls / stats.total_calls) * 100)
															: 0}% (${stats.human_calls} Calls)`
														: "0% (0 Calls)"}
												</span>
											</div>
											<div className="mt-2 h-2 rounded-full bg-slate-100">
												<div
													className="h-2 rounded-full bg-slate-900"
													style={{
														width: stats?.total_calls
															? `${(stats.human_calls / stats.total_calls) * 100}%`
															: "0%",
													}}
												/>
											</div>
										</div>
									</div>
									{stats && stats.total_duration > 0 && (
										<p className="mt-4 text-xs text-slate-500">
											The Virtual Agent automated approximately{" "}
											<strong>
												{Math.round((stats.ai_calls / stats.total_calls) * (stats.total_duration / 60)) / 60}
												{" "}hours
											</strong>
											of manual call time today, allowing front desk staff to focus on
											high-priority patient care.
										</p>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
