// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'

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

	// selects reviews relative to which game is displayed
	async relativeReviews(id) {
		const sql = `SELECT reviews.*, users.user FROM reviews, users\
									WHERE reviews.gamesid = ${id} AND users.id = reviews.userid;`
		const reviews = await this.db.all(sql)
		return reviews.reverse()
	}

	async getByIDReviews(id) {
		try {
			const sql = `SELECT users.user, reviews.* FROM reviews, users\
										WHERE reviews.userid = users.id AND gamesid = ${id};`
			console.log(sql)
			const review = await this.db.get(sql)
			return review
		} catch(err) {
			console.log(err)
			throw err
		}
	}

	// checks if current user has already reviewed this game
	async reviewChecker(reviewtag, currentUser) {
		if (reviewtag.length === 0) {
			console.log('empty')
			return 'detailedreviewIN'
		} else {
			for(const i in reviewtag) {
				console.log(reviewtag[i].userid, currentUser)
				if(reviewtag[i].userid === currentUser) {
					console.log('already reviewed')
					return 'detailedreviewOUT'
				} else {
					console.log('not reviewed')
				}
			}
			return 'detailedreviewIN'
		}
	}

	// data from the detailedreviewIN handlebar will be passed through add function
	async add(data) {
		console.log('ADD')
		console.log(data)
		try {
			// getting current date with review
			const dateTime = new Date()
			const date = `${dateTime.getDate()}/${dateTime.getMonth()+1}/${dateTime.getFullYear()}`
			// data from form inserted into database
			console.log(date)
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

	// function to close the database
	async close() {
		await this.db.close()
	}
}

// exported to allow Reviews to be used elsewhere such as gamesreviews.js
export default Reviews
