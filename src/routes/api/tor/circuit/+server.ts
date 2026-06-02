import { json, type RequestHandler } from '@sveltejs/kit';
import { getActiveCircuit, isTorControlConfigured } from '$lib/server/tor-control';
import { isTorConfigured } from '$lib/server/tor';

// Returns the live Tor circuit (guard → middle → exit) that search requests are
// travelling through, for the "view circuit" dropdown next to the search bar.
export const GET: RequestHandler = async () => {
	if (!isTorConfigured() || !isTorControlConfigured()) {
		return json(
			{ configured: false, circuit: null },
			{ headers: { 'Cache-Control': 'no-store' } }
		);
	}

	const circuit = await getActiveCircuit();
	return json(
		{ configured: true, circuit },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
};
