
import test from 'ava'
import Games from '../modules/games.js'

test('ADDING GAMES  : add game to database ', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		const addGame = await games.add({
			account: 1,
			game: 'FIFA',
			publisher: 'EA',
			release_year: 2000,
			summary: 'Alright game',
			thumbnail: 'picture.jpg'})
		// assert
		test.is(addGame, true, 'game not added')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : games displayed as an array', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		await games.add({account: 1, game: 'FIFA', publisher: 'EA', release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		const displayGames = await games.all()
		// assert
		test.is(Array.isArray(displayGames), true, 'is not array')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : FIFA game should be displayed', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		await games.add({account: 1, game: 'FIFA', publisher: 'EA', release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		const displayGame = await games.getByIDGames(1)
		console.log(displayGame)
		// assert
		test.is(displayGame.game, 'FIFA', 'FIFA not displayed.')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : displaying a game that is not on the database', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		await games.add({account: 1, game: 'FIFA', publisher: 'EA', release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		const displayGame = await games.getByIDGames(2)
		//assert
		test.is(displayGames, 'Game is in database.')
	} catch(err) {
		test.is(err.message, 'Cannot read property \'thumbnail\' of undefined')
	} finally {
		games.close()
	}
})
