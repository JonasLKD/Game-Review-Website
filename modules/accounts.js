
/** @module Accounts */

// using bcrypt to allow passwords to stored in the database securely
import bcrypt from 'bcrypt-promise'
// using sqlite to allow the use of sql commands through javascript
import sqlite from 'sqlite-async'

const saltRounds = 10

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
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * registers a new user
	 *
	 * @async
	 * @function register
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */

	async register(user, pass, email) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`username "${user}" already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.records !== 0) throw new Error(`email address "${email}" is already in use`)
		pass = await bcrypt.hash(pass, saltRounds)
		sql = `INSERT INTO users(user, pass, email) VALUES("${user}", "${pass}", "${email}")`
		await this.db.run(sql)
		return true
	}

	/**
	 * checks to see if a set of login credentials are valid
	 *
	 * @async
	 * @function login
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
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
	 * closes the database
	 *
	 * @async
	 * @function close
	 */

	async close() {
		await this.db.close()
	}
}

export default Accounts
