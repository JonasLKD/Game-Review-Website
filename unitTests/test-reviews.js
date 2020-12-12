
import test from 'ava'
import Reviews from '../modules/reviews.js'
import Accounts from '../modules/accounts.js'

test('DISPLAY REIVEWS : display all reviews on database', async test => {
	//arrange
	test.plan(1)
	const reviews = await new Reviews()
	const accounts = await new Accounts()
	//act
	try {
		const displayReviews = await reviews.all()
		test.is(isArray(displayReviews), true, 'is not array')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})