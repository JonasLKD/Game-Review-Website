
import test from 'ava'
import Games from '../modules/games.js'

test('ADDING GAMES : add game to database ', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	//act
	try {
		const addGame = await games.add({
			account: 1,
			game: 'FIFA',
			publisher: 'EA',
			release_year: '2000',
			summary: 'Alright game',
			thumbnail: 'picture.jpg'})
		//assert
		test.is(addGame, true, 'game not add')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : display all games on database', async test => {
	//arrange
	test.plan(1)
	const games = await new Games()
	//act
	try {
		const displayGames = await games.all()
		test.is(isArray(displayGames), true, 'is not array')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})
