
/** @module Public */

import Router from 'koa-router'
import bodyParser from 'koa-body'

const router = new Router()
router.use(bodyParser({multipart: true}))

import Accounts from '../modules/accounts.js'
// Games and Reviews classes are imported as their functions will be used in these routes
// as well as the website.db database
import Games from '../modules/games.js'
import Reviews from '../modules/reviews.js'
const dbName = 'website.db'

/**
 * The Logged out home page.
 *
 * @name Logged Out Home Page
 * @route {GET} /
 */

// declares records variable that will be used on the gamereviews handlebar
router.get('/', async ctx => {
	// created games object
	const games = await new Games(dbName)
	try {
		// calls the records of games
		const records = await games.all()
		// prints of the records in the terminal
		console.log(records)
		// records property added
		ctx.hbs.records = records
		// object is passed onto the index page template
		await ctx.render('index', ctx.hbs)
	} catch(err) {
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The Logged out review page.
 *
 * @name Logged Out Review Page
 * @route {GET} /reviewdetails/:id
 */

// new route for the reviewdetials handlebar for logged out users
router.get('/reviewdetails/:id', async ctx => {
	const games = await new Games(dbName)
	const reviews = await new Reviews(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// declares a reviewtag to display specific reviews related to the game
		ctx.hbs.reviewtag = await reviews.relativeReviews(ctx.params.id)
		console.log(`record: ${ctx.params.id}`)
		ctx.hbs.game = await games.getByIDGames(ctx.params.id)
		console.log(ctx.hbs)
		ctx.hbs.id = ctx.params.id
		await ctx.render('detailedreviewOUT', ctx.hbs)
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The user registration page.
 *
 * @name Register Page
 * @route {GET} /register
 */

router.get('/register', async ctx => await ctx.render('register'))

/**
 * The script to process new user registrations.
 *
 * @name Register Script
 * @route {POST} /register
 */

router.post('/register', async ctx => {
	const account = await new Accounts(dbName)
	try {
		// call the register function from account.js
		await account.register(ctx.request.body.user, ctx.request.body.pass, ctx.request.body.email)
		ctx.redirect(`/login?msg=New user "${ctx.request.body.user}" added, you need to log in`)
	} catch(err) {
		ctx.hbs.msg = err.message
		ctx.hbs.body = ctx.request.body
		console.log(ctx.hbs)
		await ctx.render('register', ctx.hbs)
	} finally {
		account.close()
	}
})

/**
 * The Login page.
 *
 * @name Login Page
 * @route {GET} /login
 */

// route for the login handlebar
router.get('/login', async ctx => {
	console.log(ctx.hbs)
	await ctx.render('login', ctx.hbs)
})

/**
 * The script to process a login.
 *
 * @name Login Script
 * @route {POST} /login
 */

// new route to post and process the data entered by the user
router.post('/login', async ctx => {
	const account = await new Accounts(dbName)
	ctx.hbs.body = ctx.request.body
	try {
		const body = ctx.request.body
		const id = await account.login(body.user, body.pass)
		ctx.session.authorised = true
		// created a cookie storing the user's id
		ctx.session.user = body.user
		ctx.session.userid = id
		const referrer = body.referrer || '/gamereviews'
		return ctx.redirect(`${referrer}?msg=You are now logged in...`)
	} catch(err) {
		ctx.hbs.msg = err.message
		await ctx.render('login', ctx.hbs)
	} finally {
		account.close()
	}
})

/**
 * The Logout page.
 *
 * @name Logout Page
 * @route {GET} /logout
 */

// route to log out the user
router.get('/logout', async ctx => {
	ctx.session.authorised = null
	delete ctx.session.user
	delete ctx.session.userid
	ctx.redirect('/?msg=You are now logged out')
})

export default router
