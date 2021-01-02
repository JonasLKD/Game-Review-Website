
/** @module Reviews */

// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using fs to allow reading text files
import fs from 'fs-extra'

/**
 * Reviews
 * ES6 module that handles adding and displaying reviews from the database.
 */

// Module that manages the games in the Games Review system.
class Reviews {

	/**
	 * Creating a reviews object
	 * @param {String} [dbName=":memory:"] - The name of the database file to use.
	 */

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// this table will be used to store the game reviews
			const sql1 = 'CREATE TABLE IF NOT EXISTS reviews(\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				userid INTEGER,\
				gamesid INTEGER,\
				review TEXT NOT NULL,\
				date TEXT NOT NULL,\
				FOREIGN KEY(userid) REFERENCES users(id)\
				FOREIGN KEY(gamesid) REFERENCES games(id));'

			// sql2 is only used for unit testing purposes
			const sql2 = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, firstn TEXT, lastn TEXT, user TEXT,\
				pass TEXT, email TEXT, bio TEXT, picture TEXT, admin TEXT);'

			// without running sql2, unit testing will throw SQL error
			await this.db.run(sql1)
			await this.db.run(sql2)
			return this
		})()
	}

	/**
	 * Games database initialisation
	 * @async
	 * @function initGames
	 * @returns {Boolean} returns true if sql command is read successfully
	 */

	async initReviews() {
		const sql = 'SELECT * FROM reviews;'
		const reviewsEmpty = await this.db.get(sql)
		if (reviewsEmpty === undefined) {
			console.log('Table empty.')
			await fs.readFile('DBinit/reviews_sql_insert.txt', 'utf-8', (err, data) => {
				if (err) throw err
				this.db.run(data)
				return true
			})
		}
		console.log('Table not empty.')
	}

	/**
	 * Registers a mock account
	 * function strictly only used for unit testing
	 *
	 * @async
	 * @function registerUnitTest
	 * @returns {Boolean} returns true if sql statement is run
	 */

	async registerUnitTest() {
		const sql = 'INSERT INTO users(firstn, lastn, user, pass, email, picture, admin) VALUES\
								("John", "Doe", "doej", "password", "doej@gmail.com", "picture.jpg", "false");'
		await this.db.run(sql)
		return true
	}

	/**
	 * Selects reviews relative to which game is displayed
	 *
	 * @async
	 * @function relativeReviews
	 * @params {Number} paramter ID from ctx.params.id
	 * @returns {Object} returns specified reviews along with user
	 */

	// reviews will be returned ordered by descending date
	async relativeReviews(id) {
		const sql = `SELECT reviews.*, users.user FROM reviews, users\
									WHERE reviews.gamesid = ${id} AND users.id = reviews.userid;`
		const reviews = await this.db.all(sql)
		return reviews.reverse()
	}

	/**
	 * Selects review that user would like to edit.
	 *
	 * @async
	 * @function chosenReview
	 * @params {Number} paramter ID from ctx.params.id
	 * @returns {Object} returns specified review along with game
	 */

	async chosenReview(id) {
		const sql = `SELECT reviews.*, games.game FROM reviews, games\
									WHERE reviews.id = ${id} AND games.id = reviews.gamesid`
		const review = await this.db.get(sql)
		return review
	}

	/**
	 * Edited review will update the existing one along with updating the date
	 *
	 * @async
	 * @function editReview
	 * @params {Object} data coming from handlebar in form as an object
	 */

	async editReview(data) {
		console.log(data)
		try{
			const max10 = 10
			let today = new Date()
			let dd = today.getDate()
			let mm = today.getMonth()+1
			const yyyy = today.getFullYear()
			if(dd < max10) dd=`0${dd}`
			if(mm < max10) mm=`0${mm}`
			today = `${dd}/${mm}/${yyyy}`
			/*const dateTime = new Date()
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`*/
			const sql = `UPDATE reviews SET review = "${data.review}", date = "${today}" WHERE\
			reviews.id = ${data.reviewid};`
			console.log(sql)
			await this.db.run(sql) //doesn't seem to be running at the moment
		} catch(err) {
			console.log(err)
			throw err
		}
	}

	/**
	 * checks if current user has already reviewed this game
	 *
	 * @async
	 * @function reviewChecker
	 * @params {Object} reviewtag parameter takes relative reviews as argument
	 * @params {Number} currentUser stores
	 * @returns {String} returns the handlebar name as a string
	 */

	async reviewChecker(reviewtag, currentUser) {
		if (reviewtag.length === 0) {
			console.log('Empty')
			return 'detailedreviewIN'
		} else {
			for(const i in reviewtag) {
				// console.log(reviewtag[i].userid, currentUser)
				if(reviewtag[i].userid === currentUser) {
					console.log('Already reviewed')
					return 'detailedreviewOUT'
				} else {
					console.log('not reviewed')
				}
			}
			return 'detailedreviewIN'
		}
	}

	/**
	 * Adds data a review to the database from the detailedreviewIN handlebar
	 *
	 * @async
	 * @function add
	 * @param {Object} object body from the handlebar data entered by user
	 * @returns {Boolean} returns true if game is added
	 */

	async add(data) {
		console.log('ADD', data)
		try {
			// getting current date with review
			const dateTime = new Date()
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
			// data from form inserted into database
			const sql = `INSERT INTO reviews(userid, gamesid, review, date)\
									VALUES(${data.account}, ${data.gamesid}, "${data.review}", "${date}")`
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

	async close() {
		await this.db.close()
	}
}

// exported to allow Reviews to be used elsewhere such as public.js and gamesreviews.js
export default Reviews
