// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using mime to allow the use of microtime stamp
import mime from 'mime-types'
// using fs to allow copying files to directories
import fs from 'fs-extra'

/* Module that manages the games in the Games Review system. */
class Games {
	/* Creating a games object */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// this table will be used to store the games
			const sql = 'CREATE TABLE IF NOT EXISTS games (\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				userid INTEGER,\
				game TEXT NOT NULL,\
				publisher TEXT NOT NULL,\
				release_year INTEGER NOT NULL,\
				thumbnail TEXT,\
				review,\
				FOREIGN KEY(userid) REFERENCES users(id)\
			);'
			// await command allows the code above to finish executing before continuing
			// essentially pausing the execution right here
			await this.db.run(sql)
			return this
			})()
	}
	
	/* retrieves all the games in the system in an array */
	async all() {
		const sql = 'SELECT users.user, games.*FROM games, users\
									WHERE games.userid = users.id;'
		const games = await this.db.all(sql)
		// checks if a thumbnail is not avaiable, a placeholder thumbnail will be used
		for(const i in games) {
			if(games[i].thumbnail === "undefined") games[i].thumbnail = 'no_picture.jpg' // used to be thumbnail === null
		}
		return games
	}
	
	async getByIDGames(id) {
		try {
			const sql = `SELECT users.user, games.* FROM games, users\
										WHERE games.userid = users.id AND games.id = ${id};`
			console.log(sql)
			const game = await this.db.get(sql)
			if(game.thumbnail === "undefined") game.thumbnail = 'no_picture.jpg'
			return game
		} catch(err) {
			console.log(err)
			throw err
		}
	}
	
	async getSpecificIDGames(id) { // added
		try {
			const sql = `SELECT users.user, games.* FROM games, users\
										WHERE games.userid = users.id AND games.id = ${id};`
			console.log(sql)
			const game = await this.db.get(sql)
			return game.id // returns the id of the game
		} catch(err) {
			console.log(err)
			throw err
		}
	}
	
	// data from the addgame handlebar will be passed through add function
	async add(data) {
		console.log('ADD')
		console.log(data)
		let filename
		if(data.fileName) {
			// provides a millisecond timestamp
			filename = `${Date.now()}.${mime.extension(data.fileType)}`
			console.log(filename)
			// the file will be copied into the images directory to be used later
			await fs.copy(data.filePath, `public/images/${filename}`)
		}
		try {
			// data from form inserted into database
			const sql = `INSERT INTO games(userid, game, publisher, release_year, review, thumbnail)\
									VALUES(${data.account}, "${data.game}", "${data.publisher}", ${data.release_year}, "${data.review}", "${filename}")`
			console.log(sql)
			await this.db.run(sql)
			return true
		} catch(err) {
			console.log(err)
			throw(err)
		}
	}
	
	// function to close the database
	async close() {
		await this.db.close()
	}
}

// exported to allow Games to be used elsewhere such as gamesreviews.js
export default Games
