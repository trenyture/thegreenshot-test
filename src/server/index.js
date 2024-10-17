import 'dotenv/config'
import Koa from 'koa'
import formidable from 'koa-formidable'

import errorsHandler from "#server/errorsHandler.js"
import initRouter from '#server/router.js'
import { unconvert } from '#modules/ConversionRequest/Scripts.js'

// On active les crons
import "./crons.js"

const initServer = async (app) => {
	app.use(formidable({
		keepExtensions: true
	}));

	// Mise en place de notre écouteur d'erreurs
	errorsHandler(app)

	// Mise en place du router
	await initRouter(app)

	// Si jamais on a interrompu le serveur pendant une conversion, on remet le fichier en conversion à son état initial
	await unconvert();

	const hostname = process.env.HOSTNAME || "localhost"
	const port = process.env.PORT || 3000
	const server = app.listen(port)
	console.info(`🚀 Listening to http://${hostname}:${port}`)
}

const app = new Koa()
initServer(app)
export default app