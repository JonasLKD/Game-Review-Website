
/** @module Games */

// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using mime to allow the use of microtime stamp
import mime from 'mime-types'
// using fs to allow copying files to directories and reading text files
import fs from 'fs-extra'
// using nodemailer as the emailing service
import nodemailer from 'nodemailer'

/**
 * Split function for emailSend
 *
 *
 * @function splitFunction
 * @params {Object} parameter checker stores ctx.params.id from the emailSend function
 * @params {Object} parameter linkGen stores the gamesid from the emailSend
 */

function splitFunction(checker, linkGen) {
	try {
		// entire processing for emailing
		const transporter = nodemailer.createTransport({
			service: 'gmail', auth: {user: 'georgerob485@gmail.com', pass: 'burgerface387'}})
		const mailDetails = {from: 'georgerob485@gmail.com', to: 'georgerob485@gmail.com',
			subject: 'Flagged Review', text: `Hey Admin, here is a flagged \
review link: https://djondoj-sem1.herokuapp.com/gamereviews/reviewdetails/${linkGen.gamesid}\
 Note: Log in first.`}
		transporter.sendMail(mailDetails, (error, info) => {
			if (error) {
				// console.log(error)
			} else {
				console.log(`Email sent: ${info.response}`)
			}
		})
	} catch(err) {
		console.log(err)
	}
}

/**
 * Games
 * ES6 module that handles adding and displaying games from the database.
 */

// Module that manages the games in the Games Review system.
class Games {

	/**
	 * Creating a games object
	 * @param {String} [dbName=":memory:"] - The name of the database file to use.
	 */

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// this table will be used to store the games
			const sql = 'CREATE TABLE IF NOT EXISTS games(\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				userid INTEGER,\
				game TEXT NOT NULL,\
				publisher TEXT NOT NULL,\
				release_year INTEGER NOT NULL,\
				thumbnail TEXT,\
				summary TEXT,\
				FOREIGN KEY(userid) REFERENCES users(id));'

			// games are stored in this table
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Games database initialisation
	 * @async
	 * @function initGames
	 * @returns {Boolean} returns true if sql command is read successfully
	 */

	// database needs to initialised for heroku
	async initGames() {
		const sql = 'SELECT * FROM games;'
		const gamesEmpty = await this.db.get(sql)
		if (gamesEmpty === undefined) {
			console.log('Table empty.')
			await fs.readFile('DBinit/games_sql_insert.txt', 'utf-8', (err, data) => {
				if (err) throw err
				this.db.run(data)
				return true
			})
		}
		console.log('Table not empty.')
	}

	/**
	 * Retrieves and displays all games from database
	 *
	 * @async
	 * @function all
	 * @returns {Object} returns all games in reverse essentially in most recent order
	 */

	async all() {
		// if users name was needed
		// SELECT users.user, games.*FROM games, users WHERE games.userid = users.id;
		const sql = 'SELECT games.* FROM games;' //
		const games = await this.db.all(sql)
		// checks if a thumbnail is not avaiable, a placeholder thumbnail will be used
		for(const i in games) {
			if(games[i].thumbnail === 'undefined') games[i].thumbnail='no_picture.jpg' // used to be thumbnail === null
		}
		// returns by the most recent game added
		return games.reverse()
	}

	/**
	 * Sends email to the admin when reviews reach amount of flags
	 *
	 * @async
	 * @function emailSend
	 * @param {Number} parameter ID from ctx.params.id
	 * @returns {Object} returns specified game
	 */

	async emailSend(checker) {
		try {
			// prevents magic numbers
			const flagMax = 2
			const check = await this.db.get(`SELECT flags FROM reviews WHERE id=${checker};`)
			const linkGen = await this.db.get(`SELECT gamesid FROM reviews WHERE id=${checker}`)
			// need to check if the flags is bigger than 2
			if(check.flags >= flagMax) {
				await splitFunction(checker, linkGen)
			}
		} catch (err) {
			//console.log(err)
		}
	}

	// retrieves specified game which is determined by the parameter ID
	async getByIDGames(id) {
		try {
			// if users name was needed
			// SELECT users.user, games.* FROM games, users WHERE games.userid = users.id AND games.id = ${id};
			const sql = `SELECT games.* FROM games WHERE games.id = ${id};`
			console.log(sql)
			const game = await this.db.get(sql)
			if(game.thumbnail === 'undefined') game.thumbnail = 'no_picture.jpg'
			return game
		} catch(err) {
			console.log(err)
			throw err
		}
	}

	/**
	 * Adds a game to the database
	 *
	 * @async
	 * @function add
	 * @param {Object} object body from the handlebar data entered by user
	 * @returns {Boolean} returns true if game is added
	 */

	// data from the addgame handlebar will be passed through add function
	async add(data) {
		console.log('ADD', data)
		let filename
		if(data.fileName) {
			// provides a millisecond timestamp
			filename = `${Date.now()}.${mime.extension(data.fileType)}`
			console.log(filename)
			// the file will be copied into the images directory to be used later
			await fs.copy(data.filePath, `public/images-game/${filename}`)
		}
		try {
			// data from form inserted into database
			const sql = `INSERT INTO games(userid, game, publisher, release_year, summary, thumbnail)\
									VALUES(${data.account}, "${data.game}", "${data.publisher}", ${data.release_year},\
									"${data.summary}", "${filename}")`
			console.log(sql)
			await this.db.run(sql)
			return true
		} catch(err) {
			console.log(err)
			throw err
		}
	}

	/**
	 * Closes the database
	 *
	 * @async
	 * @function close
	 */

	// function to close the database
	async close() {
		await this.db.close()
	}
}

// exported to allow Games to be used elsewhere such as public.js and gamesreviews.js
export default Games
