let bytesTransferredElement = document.querySelector(".bytes-transferred");

async function initialize() {
	const res = await fetch("/api/bandwidth");
	const data = await res.json();
    console.log(data)
	let result = { inbound: 0, outbound: 0 };
	data.forEach((t) => {
		result.inbound += t.usage.inbound;
		result.outbound += t.usage.outbound;
	});

	animateCounter(bytesTransferredElement, result.inbound + result.outbound);
}

function animateCounter(element, endBytes, duration = 1000) {
	const previous = parseInt(element.dataset.bytes || "0", 10);
	console.log(previous);

	if (previous === endBytes) {
		return; // No change — skip animation
	}
	const startBytes = previous;
	const startTime = performance.now();

	function update(time) {
		const elapsed = time - startTime;
		const progress = Math.min(elapsed / duration, 1);
		const currentBytes = startBytes + (endBytes - startBytes) * progress;

		const { value, unit } = formatBytes(currentBytes, false);
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
initialize();

// Fetch every 5 seconds
setInterval(initialize, 5000);

document.getElementById("download-btn").addEventListener("click", function () {
	const link = document.createElement("a");
	link.href = "assets/app-release.apk";
	link.download = "app-release.apk";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
});
