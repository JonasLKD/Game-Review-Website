
import Router from 'koa-router'

const router = new Router({ prefix: '/gamereviews' })

// Games and Reviews classes are imported as their functions will be used in these routes
import Games from '../modules/games.js'
import Reviews from '../modules/reviews.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=You need to log in&referrer=/gamereviews')
	await next()
}

router.use(checkAuth)

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
		const reviewtag = await reviews.relativeReviews(ctx.params.id) // added
		ctx.hbs.reviewtag = reviewtag // added
		console.log(`record: ${ctx.params.id}`)
		ctx.hbs.game = await games.getByIDGames(ctx.params.id)
		ctx.hbs.review = await reviews.getByIDReviews(ctx.params.id)
		ctx.session.gamesid = await games.getSpecificIDGames(ctx.params.id) // added
		console.log(ctx.hbs)
		ctx.hbs.id = ctx.params.id
		if (reviewtag.length == 0) {
			console.log("empty")
			await ctx.render('detailedreviewIN', ctx.hbs)
		} else {
			console.log("not empty")
			for(let i in reviewtag) {
					if(reviewtag[i].userid === ctx.session.userid) {
						await ctx.render('detailedreviewOUT', ctx.hbs)
					} else {
						await ctx.render('detailedreviewIN', ctx.hbs)
					}
			}
		} 
		// await ctx.render('detailedreviewIN', ctx.hbs)
		return ctx.session.gamesid // added
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

router.post('/reviewdetails/:id', async ctx => {
	const reviews = await new Reviews(dbName)
	const games = await new Games(dbName) // added
	try {
		ctx.request.body.account = ctx.session.userid
		ctx.request.body.gamesid = ctx.session.gamesid // added
		// might have to delete the cookies
		await reviews.add(ctx.request.body)
		return ctx.redirect('/gamereviews?msg=New review added')
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		reviews.close()
	}
})

// new route for the add review handlebar 
router.get('/addgame', async ctx => {
	await ctx.render('addgame', ctx.hbs)
})

// new route to post and process the data entered by the user
router.post('/addgame', async ctx => {
	const games = await new Games(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		if(ctx.request.files.thumbnail.name) {
			ctx.request.body.filePath = ctx.request.files.thumbnail.path
			ctx.request.body.fileName = ctx.request.files.thumbnail.name
			ctx.request.body.fileType = ctx.request.files.thumbnail.type
		}
		await games.add(ctx.request.body)
		console.log('adding a game review')
		return ctx.redirect('/gamereviews?msg=New game added')
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		games.close()
	}
	
})

export default router
