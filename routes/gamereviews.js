
import Router from 'koa-router'
// setting a new prefix for gamereviews page
const router = new Router({ prefix: '/gamereviews' })

// Games and Reviews classes are imported as their functions will be used in these routes
// as well as the website.db database
import Games from '../modules/games.js'
import Reviews from '../modules/reviews.js'
const dbName = 'website.db'

// function checks if the current user is logged in
async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=You need to log in&referrer=/gamereviews')
	await next()
}

router.use(checkAuth)

// declares records variable that will be used on the gamereivews handlebar
router.get('/', async ctx => {
	// created games object
	const games = await new Games(dbName)
	try {
		// calls the records of games
		const records = await games.all()
		// prints out the records in the terminal
		console.log(records)
		// records property added
		ctx.hbs.records = records
		// object is passed onto the gamereview page template
		await ctx.render('gamereviews', ctx.hbs)
	} catch(err) {
		ctx.hbs.error = err.message
		await ctx.render('error', ctx.hbs)
	}
})

// new route for the reviewdetials handlebar for logged in users
router.get('/reviewdetails/:id', async ctx => {
	const games = await new Games(dbName)
	const reviews = await new Reviews(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		// declares a reviewtag to display specific reviews related to the game
		const reviewtag = await reviews.relativeReviews(ctx.params.id)
		ctx.hbs.reviewtag = reviewtag
		console.log(`record: ${ctx.params.id}`)
		ctx.hbs.game = await games.getByIDGames(ctx.params.id)
		ctx.hbs.review = await reviews.getByIDReviews(ctx.params.id)
		// declares the gamesid cookie which will be used in the post function
		ctx.session.gamesid = await games.getSpecificIDGames(ctx.params.id)
		console.log(ctx.hbs)
		// ctx.hbs.id = ctx.params.id
		// function checks if current user has already reviewed this game
		await ctx.render(await reviews.reviewChecker(reviewtag, ctx.session.userid), ctx.hbs)
		// returns the current gamesid cookie
		return ctx.session.gamesid
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

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
		console.log('adding a review to database')
		return ctx.redirect('/gamereviews?msg=New review added')
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		reviews.close()
	}
})

// new route for the add review handlebar
router.get('/addgame', async ctx => await ctx.render('addgame', ctx.hbs))

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
		console.log(ctx.request.body)
		await games.add(ctx.request.body)
		console.log('adding a game to database')
		// user is redirected to gamesreviews page with message popup
		return ctx.redirect('/gamereviews?msg=New game added')
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		games.close()
	}

})

export default router
