// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using mime to allow the use of microtime stamp
import mime from 'mime-types'
// using fs to allow copying files to directories
import fs from 'fs-extra'

import Games from '../modules/games.js' //added

/* Module that manages the games in the Games Review system. */
class Reviews {
	/* Creating a games object */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// this table will be used to store the game reviews
			const sql = 'CREATE TABLE IF NOT EXISTS reviews (\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				userid INTEGER,\
				gamesid INTEGER,\
				review TEXT NOT NULL,\
				date TEXT NOT NULL,\
				FOREIGN KEY(userid) REFERENCES users(id)\
				FOREIGN KEY(gamesid) REFERENCES games(id)\
			);'
			// await command allows the code above to finish executing before continuing
			// essentially pausing the execution right here
			await this.db.run(sql)
			return this
			})()
	}
	
	/* retrieves all the reviews in the system in an array */
	async all() {
		const sql = 'SELECT users.user, reviews.*FROM reviews, users\
									WHERE reviews.userid = users.id;'
		const reviews = await this.db.all(sql)
		return reviews
		}
	
	async getByIDReviews(id) {
		try {
			const sql = `SELECT users.user, reviews.* FROM reviews, users\
										WHERE reviews.userid = users.id AND gamesid = ${id};`
			console.log(sql)
			const review = await this.db.get(sql)
			const dateTime = new Date(review)
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
			return review
		} catch(err) {
			console.log(err)
			throw err
		}
	}
	
	// data from the detailedreviewIN handlebar will be passed through add function
	async add(data) {
		console.log('ADD')
		console.log(data)
		try {
			// data from form inserted into database
			const sql = `INSERT INTO reviews(userid, gameid, review)\
									VALUES(${data.account}, ${data.gamesid}, "${data.review}")`
			console.log(sql)
			/*await this.db.run(sql)*/
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

// exported to allow Reviews to be used elsewhere such as gamesreviews.js
export default Reviews
