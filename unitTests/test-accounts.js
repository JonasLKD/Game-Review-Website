
import test from 'ava'
import Accounts from '../modules/accounts.js'

// should register and log in with a valid account
test('REGISTER : register and log in with a valid account', async test => {
	test.plan(1)
	const account = await new Accounts() // no database specified so runs in-memory
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
	  const login = await account.login('doej', 'password')
		// login function returns a record.id that is number datatype
		test.is(typeof login, 'number', 'unable to log in')
	} catch(err) {
		console.log(err)
		test.fail('error thrown')
	} finally {
		account.close()
	}
})

//should attempt to register a duplicate username
test('REGISTER : register a duplicate username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "doej" already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to register with a blank username
test('REGISTER : error if blank username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: undefined,
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to register with a blank password
test('REGISTER : error if blank password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: undefined,
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to register with a blank email
test('REGISTER : error if blank email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: undefined,
			picture: 'picture.jpg',
			admin: 'false'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'missing field', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to register with a duplicate email
test('REGISTER : error if duplicate email', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'bloggsj',
			pass: 'newpassword',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'email address "doej@gmail.com" is already in use', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to login with a username that is not stored in the database
test('LOGIN    : invalid username', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		await account.login('roej', 'password')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'username "roej" not found', 'incorrect error message')
	} finally {
		account.close()
	}
})

// should attempt to login with a password not linked the username entered
test('LOGIN    : invalid password', async test => {
	test.plan(1)
	const account = await new Accounts()
	try {
		await account.register({
			firstn: 'John',
			lastn: 'Doe',
			user: 'doej',
			pass: 'password',
			email: 'doej@gmail.com',
			picture: 'picture.jpg',
			admin: 'false'})
		await account.login('doej', 'bad')
		test.fail('error not thrown')
	} catch(err) {
		test.is(err.message, 'invalid password for account "doej"', 'incorrect error message')
	} finally {
		account.close()
	}
})
