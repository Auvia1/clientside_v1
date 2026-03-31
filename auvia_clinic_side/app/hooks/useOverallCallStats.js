import { useState, useEffect } from "react";
import { callsApi } from "../lib/api";
import { extractApiData } from "../lib/utils";

/**
 * Hook to fetch overall (all-time) call statistics
 * @returns {object} { stats, loading } - Stats object and loading state
 */
export function useOverallCallStats() {
	const [stats, setStats] = useState({
		total_calls: 0,
		incoming_calls: 0,
		outgoing_calls: 0,
		ai_calls: 0,
		human_calls: 0,
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true);
		// Fetch overall stats (no date filters to get all-time data)
		callsApi.getStats({})
			.then((response) => {
				const data = extractApiData(response, {});
				setStats({
					total_calls: data.total_calls || 0,
					incoming_calls: data.incoming_calls || 0,
					outgoing_calls: data.outgoing_calls || 0,
					ai_calls: data.ai_calls || 0,
					human_calls: data.human_calls || 0,
				});
				console.log("Overall Call Stats:", data);
			})
			.catch((err) => {
				console.error("Error fetching overall call stats:", err);
				setStats({
					total_calls: 0,
					incoming_calls: 0,
					outgoing_calls: 0,
					ai_calls: 0,
					human_calls: 0,
				});
			})
			.finally(() => setLoading(false));
	}, []);

	return { stats, loading };
}
