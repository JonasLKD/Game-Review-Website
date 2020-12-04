
import Router from 'koa-router'

const router = new Router({ prefix: '/gamereviews' })

import Reviews from '../modules/reviews.js'
const dbName = 'website.db'

async function checkAuth(ctx, next) {
	console.log('secure router middleware')
	console.log(ctx.hbs)
	if(ctx.hbs.authorised !== true) return ctx.redirect('/login?msg=you need to log in&referrer=/secure')
	await next()
}

router.use(checkAuth)

router.get('/', async ctx => {
	// created reviews object
	const reviews = await new Reviews(dbName)
	try {
		// calls the records of reviews 
		const records = await reviews.all()
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

// new route for the reviewdetials handlebar
router.get('/reviewdetails/:id', async ctx => {
	try {
		console.log(`record: ${ctx.params.id}`)
		ctx.hbs.id = ctx.params.id
		await ctx.render('detailedreview', ctx.hbs)
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	}
})

// new route for the add review handlebar 
router.get('/addreview', async ctx => {
	await ctx.render('addreview', ctx.hbs)
})

// new route to post and process the data entered by the user
router.post('/addreview', async ctx => {
	const reviews = await new Reviews(dbName)
	try {
		ctx.request.body.account = ctx.session.userid
		if(ctx.request.files.thumbnail.name) {
			ctx.request.body.filePath = ctx.request.files.thumbnail.path
			ctx.request.body.fileName = ctx.request.files.thumbnail.name
			ctx.request.body.fileType = ctx.request.files.thumbnail.type
		}
		await reviews.add(ctx.request.body)
		console.log('adding a review')
		return ctx.redirect('/gamereviews?msg=New review added')
	} catch(err) {
		console.log(err)
		await ctx.render('error', ctx.hbs)
	} finally {
		reviews.close()
	}
	
})

export default router
