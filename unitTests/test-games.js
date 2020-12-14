
import test from 'ava'
import Games from '../modules/games.js'

test('ADDING GAMES  : add a game to database ', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		// adding a mock game to the database
		const addGame = await games.add({
			account: 1,
			game: 'FIFA 2001',
			publisher: 'EA',
			release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		// assert
		// once added the function should return true
		test.is(addGame, true, 'game not added')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : display all games currenly in database', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	// adding 3 mock games to the database
	try {
		await games.add({account: 1, game: 'FIFA 2001', publisher: 'EA', release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		await games.add({account: 1, game: 'Sonic Battle', publisher: 'Sega', release_year: 2003,
			summary: 'Blue hedgehog runs fast',
			thumbnail: 'picture.jpg'})
		await games.add({account: 1, game: 'Super Mario 64', publisher: 'EA', release_year: 1996,
			summary: 'Short plumber trying to save princess.',
			thumbnail: 'picture.jpg'})
		const displayGames = await games.all()
		// assert
		// the same 3 mock games added should be displayed as an array
		test.is(displayGames.length, 3, 'Does not display all games')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : FIFA game should display', async test => {
	// arrange
	test.plan(1)
	const games = await new Games()
	// act
	try {
		await games.add({account: 1, game: 'FIFA 2001', publisher: 'EA', release_year: 2000,
			summary: 'FIFA is a football game.',
			thumbnail: 'picture.jpg'})
		const displayGame = await games.getByIDGames(1)
		console.log(displayGame)
		// assert
		test.is(displayGame.game, 'FIFA 2001', 'FIFA 2001 is not displayed.')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		games.close()
	}
})

test('DISPLAY GAMES : display a game that is not on the database', async test => {
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
