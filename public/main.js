
/* main.js */

window.addEventListener('DOMContentLoaded', event => {
	console.log('DOMContentLoaded')
	// delay for 2000ms equivalent to 2 seconds
	const delay = 2000
	// once the delay is triggered via the callback function, the aside message will be hidden
	document.querySelector('aside').hidden = false
	window.setTimeout( () => {
		document.querySelector('aside').hidden = true
	}, delay)
})
