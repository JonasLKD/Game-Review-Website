
/* main.js */

window.addEventListener('DOMContentLoaded', event => {
	console.log('DOMContentLoaded')
	if(document.querySelector('aside')) {
		const delay = 2000 	// delay for 2000ms equivalent to 2 seconds
		// once the delay is triggered via the callback function, the aside message will be hidden
		document.querySelector('aside').hidden = false
		window.setTimeout( () => {
			document.querySelector('aside').hidden = true
		}, delay)
	}
	if(document.querySelector('input')) {
		document.querySelectorAll('input').forEach( element => {
			element.addEventListener('invalid', event => {
				if(!event.target.validity.valid) {
					// if dataset is undefined it will display the invalid data message
					const msg = event.target.dataset.msg || 'Invalid data'
					event.target.setCustomValidity(msg)
				}
			})
			// when text is changed the message is reset
			element.addEventListener('input', event => {
				event.target.setCustomValidity('')
			})
		}, false)
	}
	// querySelector block for textarea
	if(document.querySelector('textarea')) {
		document.querySelectorAll('textarea').forEach( element => {
			element.addEventListener('invalid', event => {
				if(!event.target.validity.valid) {
					// if dataset is undefined it will display the invalid data message
					const msg = event.target.dataset.msg || 'Invalid data'
					event.target.setCustomValidity(msg)
				}
			})
			// when text is changed the message is reset
			element.addEventListener('textarea', event => {
				event.target.setCustomValidity('')
			})
		}, false)
	}
})
