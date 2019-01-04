export function insertAdjacentHTML(html) {
	return `this.insertAdjacentHTML('beforebegin', '${html.replace(/"/g, "\\'").replace(/\n\s*/g, '')}');`;
}
