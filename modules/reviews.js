// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'

/* Module that manages the contacts in the Games Review system. */
class Reviews {
	/* Creating a reviews object */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// this table will be used to store the game reviews
			const sql = 'CREATE TABLE IF NOT EXISTS reviews (\
				id INTEGER PRIMARY KEY AUTOINCREMENT,\
				userid INTEGER,\
				game TEXT NOT NULL,\
				publisher TEXT NOT NULL,\
				release_year INTEGER NOT NULL,\
				thumbnail TEXT,\
				FOREIGN KEY(userid) REFERENCES users(id)\
			);'
			// await command allows the code above to finish executing before continuing
			// essentially pausing the execution right here
			await this.db.run(sql)
			return this
			})()
	}
	
	/* retrieves all the reviews in the system as in an array */
	async all() {
		const sql = 'SELECT users.user, reviews.*FROM reviews, users\
									WHERE reviews.userid = users.id;'
		const reviews = await this.db.all(sql)
		return reviews
	}
}

// exported to allow Reviews to be used elsewhere such as gamesreviews.js
export default Reviews