
import test from 'ava'
import Reviews from '../modules/reviews.js'

/* should add a review to the database */
test('ADDING REVIEWS : add a review to database', async test => {
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

/* should only display 2 reviews as the id is 1 */
test('DISPLAY REVIEWS : display all reviews for specified game', async test => {
	// arrange
	test.plan(1)
	const reviews = await new Reviews()
	// act
	try {
		// mock account is registered in the reviews.js module
		await reviews.registerUnitTest()
		// adding 2 reviews with gamesid 1
		await reviews.add({
				review: 'game is cool.',
				account: 1,
				gamesid: 1})
		await reviews.add({
				review: 'the game is sick.',
				account: 1,
				gamesid: 1})
		// added 1 review with gamesid 2
		await reviews.add({
				review: 'it is alright.',
				account: 1,
				gamesid: 2})
		const displayReviews = await reviews.relativeReviews(1)
		// assert
		test.is(displayReviews.length, 2, 'does not display reviews for specified game')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})

/* should display no reviews */
test('DISPLAY REVIEWS : display reviews for a game with no reviews', async test => {
	// arrange
	test.plan(1)
	const reviews = await new Reviews()
	// act
	try {
		// mock account is registered in the reviews.js module
		await reviews.registerUnitTest()
		// adding 2 reviews with gamesid 1
		await reviews.add({
				review: 'game is cool.',
				account: 1,
				gamesid: 1})
		await reviews.add({
				review: 'the game is sick.',
				account: 1,
				gamesid: 1})
		const displayReviews = await reviews.relativeReviews(2)
		// assert 
		test.is(displayReviews.length, 0, 'there are reviews for this game')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})

/* game has no reviews and user is logged in, the multiline textarea will display */
test('CHECK REVIEW : game has no reviews', async test => {
	//arrange
	test.plan(1)
	const reviews = await new Reviews()
	// act
	try {
		// mock account is registered in the reviews.js module
		await reviews.registerUnitTest()
		// assert
		const reviewCheck = await reviews.reviewChecker([], 1)
		test.is(reviewCheck, 'detailedreviewIN')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})

/* game has reviews and user is logged in but has not reviewed the game yet,
 * the multiline textarea will display */
test('CHECK REVIEW : game has reviews', async test => {
	//arrange
	test.plan(1)
	const reviews = await new Reviews()
	// act
	try {
		// mock account is registered in the reviews.js module
		await reviews.registerUnitTest()
		// assert
		const reviewCheck = await reviews.reviewChecker([{
				id: 1,
				userid: 2,
				gamesid: 1,
				review: 'I love this game',
				data: '12/12/2020',
				user: 'doej'
			}], 1)
		test.is(reviewCheck, 'detailedreviewIN')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})

/* game has reviews, user is logged in and has reviewed the game,
 * the multiline textarea will not display */
test('CHECK REVIEW : game has reviews and user has reviewed', async test => {
	//arrange
	test.plan(1)
	const reviews = await new Reviews()
	// act
	try {
		// mock account is registered in the reviews.js module
		await reviews.registerUnitTest()
		// assert
		const reviewCheck = await reviews.reviewChecker([{
				id: 1,
				userid: 1,
				gamesid: 1,
				review: 'I love this game',
				data: '12/12/2020',
				user: 'doej'
			}], 1)
		test.is(reviewCheck, 'detailedreviewOUT')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		reviews.close()
	}
})
