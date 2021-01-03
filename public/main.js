
/* main.js */

// once the delay is triggered via the callback function, the aside message will be hidden
window.addEventListener('DOMContentLoaded', () => {
	console.log('DOMContentLoaded')

	if(document.querySelector('aside')) {
		const delay = 2000 	// 5000ms = 5 seconds
		document.querySelector('aside').hidden = false
		window.setTimeout( () => {
			document.querySelector('aside').hidden = true
		}, delay)
	}

	// if there is a button that has a class of back and if clicked
	// the page is rolled to the previous page
	if(document.querySelector('button.back')) {
		document.querySelectorAll('button.back').forEach( element => {
			element.addEventListener('click', () => {
				console.log('back button clicked')
				console.log(window.history)
				window.history.back()
			})
		})
	}
})

// if the input fields don't meet requirements they will stay invalid
window.addEventListener('DOMContentLoaded', () => {
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
})

// same process as input eventlistener above
window.addEventListener('DOMContentLoaded', () => {
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

window.onload = function() {
	//Reference the DropDownList.
	const ddlYears = document.getElementById('ddlYears')

	//Determine the Current Year.
	const currentYear = new Date().getFullYear()

	//Loop and add the Year values to DropDownList.
	for (let i = 1940; i <= currentYear; i++) {
		const option = document.createElement('OPTION')
		option.innerHTML = i
		option.value = i
		ddlYears.appendChild(option)
	}
}
