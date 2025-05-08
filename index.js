let bytesTransferredElement = document.querySelector(".bytes-transferred");
function fetchData() {
	fetch("http://localhost:3001/client/usage")
		.then(async (response) => {
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			console.log(data);
			animateCounter(bytesTransferredElement, data.inbound);
		})
		.catch((error) => {
			console.error("Error fetching data:", error);
		});
}

function animateCounter(element, endBytes, duration = 1000) {
	const previous = parseInt(element.dataset.bytes || "0", 10);
	console.log(previous);

	if (previous === endBytes) {
		return; // No change — skip animation
	}
	const startBytes = 0;
	const startTime = performance.now();

	function update(time) {
		const elapsed = time - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const currentBytes = startBytes + (endBytes - startBytes) * progress;

		const { value, unit } = formatBytes(currentBytes);
		element.innerText = Math.round(value) + " " + unit;

		if (progress < 1) {
			requestAnimationFrame(update);
		}
	}

	// Store current value for future comparisons
	element.dataset.bytes = endBytes.toString();

	requestAnimationFrame(update);
}

function formatBytes(bytes, includeGB = true) {
	const KB = 1024;
	const MB = KB * 1024;
	const GB = MB * 1024;

	let value, unit;

	if (includeGB && bytes >= GB) {
		value = bytes / GB;
		unit = "GB";
	} else if (bytes >= MB) {
		value = bytes / MB;
		unit = "MB";
	} else if (bytes >= KB) {
		value = bytes / KB;
		unit = "KB";
	} else {
		value = bytes;
		unit = "B";
	}

	return {
		value,
		unit,
		formatted: value.toFixed(2) + " " + unit,
		bytes,
	};
}

// Initial fetch
fetchData();

// Fetch every 5 seconds
setInterval(fetchData, 5000);
