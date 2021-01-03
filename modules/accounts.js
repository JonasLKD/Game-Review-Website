
/** @module Accounts */

// using bcrypt to allow passwords to stored in the database securely
import bcrypt from 'bcrypt-promise'
// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'
// using mime to allow the use of microtime stamp
import mime from 'mime-types'
// using fs to allow copying files to directories and reading text files
import fs from 'fs-extra'

const saltRounds = 10

/**
 * Checks for undefined object properties
 * function strictly only used for unit testing
 *
 * @function missingChecker
 * @param {Object} paramter data for register data
 */

function missingChecker(data) {
	for(const i in data) {
		if(!data[i]) throw new Error('missing field')
	}
}

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */

class Accounts {

	/**
   * Creating an accounts object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */

	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, firstn TEXT, lastn TEXT, user TEXT,\
				pass TEXT, email TEXT, bio TEXT, picture TEXT, admin TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * Accounts database initialisation
	 *
	 * @async
	 * @function initAccounts
	 * @returns {Boolean} returns true if sql command is read successfully
	 */

	async initAccounts() {
		const accountsEmpty = await this.db.get('SELECT * FROM users;')
		if (accountsEmpty === undefined) {

			/**
			 * Encrypts passwords
			 *
			 * @async
			 * @function passEncrypt
			 * @param {String} password parameter will take in passwords passed as arguments
			 * @returns {String} returns the password that is encrypted into a hash
			 */

			// another async function used so that the same passwords have different bcrypt hashes
			async function passEncrypt(pass) {
				const passw = await bcrypt.hash(pass, saltRounds)
				return passw
			}
			const sqlInsert = `INSERT INTO users(firstn, lastn, user, pass, email, bio, picture, admin)\
			VALUES("John", "Smith", "user1", "${await passEncrypt('p455w0rd')}", "user1@gmail.com", "Test Account",\
			"def_pic.png", "true"),\
			("Michael", "Brown", "user2", "${await passEncrypt('p455w0rd')}", "user2@gmail.com", "Test Account",\
			"def_pic.png", "false"),\
			("Ana", "Davis", "user3", "${await passEncrypt('p455w0rd')}", "user3@gmail.com", "Test Account",\
			"def_pic.png", "false");`
			console.log('Table empty.')
			this.db.run(sqlInsert)
			return true
		}
		console.log('Table not empty.')
	}

	/**
	 * Selects the current account
	 *
	 * @async
	 * @function
	 * @param {Number} paramter id from the current user
	 * @returns {Object} returns all details of current user
	 */

	async relativeAccounts(id) {
		const sql = `SELECT users.* FROM users WHERE users.id = ${id};`
		const accounts = await this.db.get(sql)
		for(const i in accounts) {
			if(accounts[i].picture === 'undefined') accounts[i].picture='def_pic.png'
		}
		return accounts
	}

	/**
	 * Selects the reviews assoicated with current user
	 * @async
	 * @function
	 * @param {Number} paramter id from the current user
	 * @returns {Object} returns all reviews with associated account
	 */

	// reviews will be returned ordered by descending date
	async accountReviews(id) {
		const sql = `SELECT reviews.*, games.game FROM reviews, games\
									WHERE reviews.userid = ${id} AND games.id = reviews.gamesid ORDER BY\
									SUBSTR(date, 7, 10) DESC, SUBSTR(Date, 4, 5) DESC, SUBSTR(Date, 1, 2) DESC,\
									id DESC;`
		const accReviews = await this.db.all(sql)
		return accReviews
	}

	/**
	 * Edited profile will update the existing one along with updating the date
	 *
	 * @async
	 * @function editAccount
	 * @params {Object} data coming from handlebar in form as an object
	 */

	async editAccount(data) {
		console.log(data)
		try{
			let filename
			// checks if fileName is included, if so filename will be generated for the picture
			if(data.fileName) {
				// provides a millisecond timestamp
				filename = `${Date.now()}.${mime.extension(data.fileType)}`
				// the file will be copied into the images directory to be used later
				await fs.copy(data.filePath, `public/images-profile/${filename}`)
				const sql = `UPDATE users SET firstn = "${data.firstn}", lastn = "${data.lastn}",\
				picture = "${filename}", bio = "${data.bio}" WHERE users.id = ${data.account};`
				await this.db.run(sql)
			}
			// if not the picture will not be updated as the user could have a picture already
			const sql = `UPDATE users SET firstn = "${data.firstn}", lastn = "${data.lastn}",\
			bio = "${data.bio}" WHERE users.id = ${data.account};`
			await this.db.run(sql)
		} catch(err) {
			console.log(err)
			throw err
		}
	}

	/**
	 * Registers a new user
	 *
	 * @async
	 * @function register
	 * @param {Object} contains all data from register user input
	 * @returns {Boolean} returns true if the new user has been added
	 */

	async register(data) {
		await missingChecker(data)
		let filename
		if(data.fileName) {
			// provides a millisecond timestamp
			filename = `${Date.now()}.${mime.extension(data.fileType)}`
			// the file will be copied into the images directory to be used later
			await fs.copy(data.filePath, `public/images-profile/${filename}`)
		}
		if(!filename) filename='def_pic.png'
		// sql variable removed and command was place directly into get function to
		// prevent linter warnings/errors
		const check = await this.db.get(`SELECT COUNT(id) as records FROM users WHERE user="${data.user}";`)
		if(check.records !== 0) throw new Error(`username "${data.user}" already in use`)
		const emails = await this.db.get(`SELECT COUNT(id) as records FROM users WHERE email="${data.email}";`)
		if(emails.records !== 0) throw new Error(`email address "${data.email}" is already in use`)
		const pass = await bcrypt.hash(data.pass, saltRounds)
		const sql = `INSERT INTO users(firstn, lastn, user, pass, email, bio, picture, admin) VALUES\
		("${data.firstn}", "${data.lastn}", "${data.user}", "${pass}", "${data.email}", "${data.bio}",\
		"${filename}", "false")`
		await this.db.run(sql)
		return true
	}

	/**
	 * Checks to see if a set of login credentials are valid
	 *
	 * @async
	 * @function login
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Number} returns record.id if everything passes
	 */

	async login(username, password) {
		let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)
		// retrieves the id and password
		sql = `SELECT id, pass FROM users WHERE user = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.pass)
		if(valid === false) throw new Error(`invalid password for account "${username}"`)
		// returns the id from the record
		return record.id
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

export default Accounts
