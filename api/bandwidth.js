export default async function handler(req, res) {
	try {
		const nodes = await getNodes();
		if (!nodes) {
			return res.status(500).json({ error: "Failed to fetch nodes" });
		}

		// Fetch bandwidth from all nodes in parallel
		const results = await Promise.all(
			nodes.map(async (node) => {
				const url = `${removeIpScheme(node.ip)}:${node.apiPort}`;
				const usage = await fetchData(url);
				return { node, usage };
			})
		);

		res.status(200).json(results);
	} catch (error) {
		console.error("Error:", error);
		res.status(500).json({ error: "Unexpected error occurred" });
	}
}

async function getNodes() {
	try {
		const response = await fetch("http://206.189.156.2:3001/network/all-nodes");
		if (!response.ok) throw new Error(`Node fetch failed: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error("getNodes error:", error);
		return null;
	}
}

async function fetchData(url) {
	try {
		const response = await fetch(`http://${url}/client/usage`);
		if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error(`fetchData error (${url}):`, error);
		return null;
	}
}

function removeIpScheme(ip) {
	return ip.replace(/^https?:\/\//, "");
}
