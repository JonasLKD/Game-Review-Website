
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

export default router
