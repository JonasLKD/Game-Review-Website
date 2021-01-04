
/** @module Game Reviews */

import Router from 'koa-router'
// setting a new prefix for gamereviews page
const router = new Router({ prefix: '/gamereviews' })

// Games and Reviews classes are imported as their functions will be used in these routes
// as well as the website.db database
import Games from '../modules/games.js'
import Reviews from '../modules/reviews.js'
import Accounts from '../modules/accounts.js'
const dbName = 'website.db'

/**
	 * checks if the current user is authorised/logged in
	 *
	 * @async
	 * @function checkAuth
	 * @param {*} ctx parameter
	 * @param {*} next parameter
	 * @returns {String} returns a redirect url with a message
	 */

// function checks if the current user is logged in
async function checkAuth(ctx, next) {
	// console.log('secure router middleware')
	// console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=You need to log in&referrer=/gamereviews')
	await next()
}

router.use(checkAuth)

/**
 * The Logged in home page
 *
 * @name Logged In Home Page
 * @route {GET} /
 */

// declares records variable that will be used on the gamereivews handlebar
router.get('/', async ctx => {
	// created games object
	const games = await new Games(dbName)
	try {
		// retrieves all games in the database
		ctx.hbs.records = await games.all()
		// prints out the records in the terminal
		// console.log(records)
		// records property added and will passed onto the gamereview handlebar
		await ctx.render('gamereviews', ctx.hbs)
	} catch(err) {
		// ctx.hbs.error = err.message
		// await ctx.render('error', ctx.hbs)
	}
})

/**
 * The user profile page
 *
 * @name Profile Page
 * @route {GET} /profile
 */

router.get('/profile', async ctx => {
	// created accounts object
	const account = await new Accounts(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// retrieves account info and added to handlebar
		ctx.hbs.info = await account.relativeAccounts(ctx.session.userid)
		// retrieves all reviews of current user and added to handlebar
		ctx.hbs.accRev = await account.accountReviews(ctx.session.userid)
		await ctx.render('profile', ctx.hbs)
	} catch(err) {
		// await ctx.render('error', ctx.hbs)
	}
})

/**
 * The user edit profile page
 *
 * @name Edit Profile Page
 * @route {GET} /editprofile
 */

router.get('/editprofile', async ctx => {
	// created accounts object
	const account = await new Accounts(dbName)
	try {
		ctx.hbs.infoEdit = await account.relativeAccounts(ctx.session.userid)
		await ctx.render('editprofile', ctx.hbs)
	} catch(err) {
		// await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to process editing a profile/account
 *
 * @name Edit a Profile Script
 * @route {POST} /editprofile
 */

router.post('/editprofile', async ctx => {
	const account = await new Accounts(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// filepath, name and type is needed to create mime extension
		if(ctx.request.files.avatar.name) {
			ctx.request.body.filePath = ctx.request.files.avatar.path
			ctx.request.body.fileName = ctx.request.files.avatar.name
			ctx.request.body.fileType = ctx.request.files.avatar.type
		}
		await account.editAccount(ctx.request.body)
		const userpics = await account.relativeAccounts(ctx.session.userid)
		ctx.session.userpic = userpics.picture
		//ctx.request.body.userpic = ctx.session.userpic
		return ctx.redirect('/gamereviews/profile?msg=Profile edited')
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

/**
 *
 * @name Edit Review Page
 * @route {GET} /editreview/:id
 */

router.get('/editreview/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		ctx.hbs.selectedReview = await reviews.chosenReview(ctx.params.id)
		ctx.session.reviewid = ctx.hbs.selectedReview.id
		await ctx.render('editreview', ctx.hbs)
		return ctx.session.reviewid
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to process editing a review
 *
 * @name Edit a Review Script
 * @route {POST} /editreview/:id
 */

router.post('/editreview/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		ctx.request.body.reviewid = ctx.session.reviewid
		await reviews.editReview(ctx.request.body)
		return ctx.redirect('/gamereviews/profile?msg=Review edited')
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The Logged in review page
 *
 * @name Logged In Review Page
 * @route {GET} /reviewdetails/:id
 */

// new route for the reviewdetails handlebar for logged in users
router.get('/reviewdetails/:id', async ctx => {
	const games = await new Games(dbName)
	const reviews = await new Reviews(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// declares a reviewtag to display specific reviews related to the game
		ctx.hbs.reviewtag = await reviews.relativeReviews(ctx.params.id)
		// console.log(`record: ${ctx.params.id}`)
		ctx.hbs.game = await games.getByIDGames(ctx.params.id)
		// declares the gamesid cookie which will be used in the post function
		ctx.session.gamesid = ctx.hbs.game.id
		// function checks if current user has already reviewed this game
		// console.log(ctx.hbs)
		await ctx.render(await reviews.reviewChecker(ctx.hbs.reviewtag, ctx.session.userid, ctx.session.admin), ctx.hbs)
		// returns the current gamesid cookie
		return ctx.session.gamesid
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

/**
 * The script to process adding a review
 *
 * @name Add Review Script
 * @route {POST} /reviewdetails/:id
 */

// new route to post and process the data entered by the user
router.post('/reviewdetails/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		// adds both userid and gamesid to the handlebar data bodies
		// to be used later on in the SQL insertions
		ctx.request.body.account = ctx.session.userid
		// uses the returned gamesid cookie
		ctx.request.body.gamesid = ctx.session.gamesid
		// calls the add function from reviews.js
		await reviews.add(ctx.request.body)
		// displays a message saying a new review was added
		return ctx.redirect('/gamereviews?msg=New review added')
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		reviews.close()
	}
})

/**
 * The script to process a flag on a review
 *
 * @name Flag Script
 * @route {POST} /flag/:id
 */

//flags need to be updated when flag button is clicked
router.post('/flag/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	const games = await new Games(dbName)
	try {
		await reviews.flagger(ctx.params.id)
		// checks if the review has hit the flags limit
		await games.emailSend(ctx.params.id)
		return ctx.redirect('/gamereviews?msg=Review flagged')
	} finally {
		reviews.close()
	}
})

/**
 * The script to process a approve on a review
 *
 * @name Flag Script
 * @route {POST} /approve/:id
 */

// admins can post this route by clicking the approve button resetting all flags
// and setting hidden to false
router.post('/approve/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		await reviews.approve(ctx.params.id)
		return ctx.redirect('/gamereviews?msg=Review approved')
	}	finally {
		reviews.close()
	}
})

/**
 * The script to process a delete a review
 *
 * @name Flag Script
 * @route {POST} /delete/:id
 */

// if admins decide to delete a review the delete button will activate this
// route for deletion
router.post('/delete/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		await reviews.delete(ctx.params.id)
		return ctx.redirect('/gamereviews?msg=Review deleted')
	} finally {
		reviews.close()
	}
})

/**
 * The Add game page.
 *
 * @name Add Game Page
 * @route {GET} /addgame
 */

// new route for the add review handlebar
router.get('/addgame', async ctx => await ctx.render('addgame', ctx.hbs))

/**
 * The script to process adding a game.
 *
 * @name Add Game Script
 * @route {POST} /addgame
 */

// new route to post and process the data entered by the user
router.post('/addgame', async ctx => {
	const games = await new Games(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// adds the file's path, name, type to the handlebar data bodies
		if(ctx.request.files.thumbnail.name) {
			ctx.request.body.filePath = ctx.request.files.thumbnail.path
			ctx.request.body.fileName = ctx.request.files.thumbnail.name
			ctx.request.body.fileType = ctx.request.files.thumbnail.type
		}
		await games.add(ctx.request.body)
		// user is redirected to gamesreviews page with message popup
		return ctx.redirect('/gamereviews?msg=New game added')
	} catch(err) {
		// console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		games.close()
	}
})

export default router
