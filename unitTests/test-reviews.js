
import test from 'ava'
import Reviews from '../modules/reviews.js'
import Accounts from '../modules/accounts.js'

test('ADDING REVIEWS : add review to database', async test => {
		// arrange
		test.plan(1)
		const reviews = await new Reviews()
		// act
		try {
			const addReview = await reviews.add({
				review: 'game is cool.',
				account: 1,
				gamesid: 1})
			// assert
			test.is(addReview, true, 'review not added')
		} catch(err) {
			console.log(err)
			test.fail('error thrown')
		} finally {
			reviews.close()
		}
})
		
test('DISPLAY REIVEWS : display all reviews for 1st game', async test => {
	// arrange
	test.plan(1)
	const reviews = await new Reviews()
	const accounts = await new Accounts()
	// act
	try {
		await accounts.register('doej', 'password', 'doej@gmail.com')
		await reviews.add({
				review: 'game is cool.',
				account: 1,
				gamesid: 1})
		const displayReviews = await reviews.relativeReviews(1)
		// assert
		test.is(Array.isArray(displayReviews), true, 'is not array')
		console.log(displayReviews)
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})