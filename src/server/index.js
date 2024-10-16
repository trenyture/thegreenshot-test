import 'dotenv/config'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import errorsHandler from "#server/errorsHandler.js"
import initRouter from '#server/router.js'


const initServer = async (app) => {
	app.use(bodyParser())

	// Mise en place de notre écouteur d'erreurs
	errorsHandler(app)

	// Mise en place du router
	await initRouter(app)

	const port = process.env.PORT || 3000
	const server = app.listen(port)
	console.info(`🚀 Listening to http://localhost:${port}`)
}

const app = new Koa()
initServer(app)
export default app