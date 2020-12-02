// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using mime to allow the use of microtime stamp
import mime from 'mime-types'
// using fs to allow copying files to directories
import fs from 'fs-extra'

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
				review,\
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
		// checks if a thumbnail is not avaiable, a placeholder thumbnail will be used
		for(const i in reviews) {
			if(reviews[i].thumbnail === null) reviews[i].thumbnail = 'https://upload.wikimedia.org/wikipedia/en/6/60/No_Picture.jpg'
		}
		return reviews
	}
	
	// data from the review form will be passed through add function
	async add(data) {
		// console.log('ADD')
		console.log(data)
		let filename
		if(data.fileName) {
			// provides a millisecond timestamp
			filename = `${Date.now()}.${mime.extension(data.fileType)}`
			console.log(filename)
			// the file will be copied into the correct directory
			await fs.copy(data.filePath, `public/images/${filename}`)
		}
		try {
			// data from form inserted into database
			const sql = `INSERT INTO reviews(userid, game, publisher, release_year, review, thumbnail)\
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

// exported to allow Reviews to be used elsewhere such as gamesreviews.js
export default Reviews
