// Synchronous theme application - runs in <head> before paint to avoid FOUC.
// Reads the most recent theme choice from localStorage (which the options
// page keeps in sync with chrome.storage.sync).
(function () {
	try {
		var t = localStorage.getItem('libresearch-ext-theme') || 'dark';
		if (t === 'auto') {
			t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
		}
		document.documentElement.dataset.theme = t;
		document.documentElement.style.colorScheme = t === 'light' || t === 'sand' ? 'light' : 'dark';
	} catch (e) {
		/* localStorage blocked - fall back to the default dark theme */
	}
})();
