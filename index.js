
import Koa from 'koa'
import serve from 'koa-static'
import views from 'koa-views'
import session from 'koa-session'

import router from './routes/routes.js'

const app = new Koa()
app.keys = ['darkSecret']

const defaultPort = 8080
const port = process.env.PORT || defaultPort

async function getHandlebarData(ctx, next) {
	console.log(`${ctx.method} ${ctx.path}`)
	ctx.hbs = {
		authorised: ctx.session.authorised,
		// pulls values
		user: ctx.session.user,
		userid: ctx.session.userid,
		gamesid: ctx.session.gamesid, // added to store gamesid
		host: `https://${ctx.host}`
	}
	for(const key in ctx.query) ctx.hbs[key] = ctx.query[key]
	await next()
}

// declaring database name and importing classes needed for initialisation
const dbName = 'website.db'
import Accounts from './modules/accounts.js'
import Games from './modules/games.js'
import Reviews from './modules/reviews.js'
// initialises the database when the server starts up
async function DBinit() {
	const accounts = await new Accounts(dbName)
	const games = await new Games(dbName)
	const reviews = await new Reviews(dbName)
	try {
		// used await so code can wait until functions a finish running
		await accounts.initAccounts()
		await games.initGames()
		await reviews.initReviews()
	} catch(err) {
		console.log(err)
	}
}

DBinit()

app.use(serve('public'))
app.use(session(app))
app.use(views('views', { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

app.use(getHandlebarData)

app.use(router.routes())
app.use(router.allowedMethods())

app.listen(port, async() => console.log(`listening on port ${port}`))
