import http from 'http'
import { customThrow } from '#utils/Helpers.js'

// On va créer un middleware qui va écouter le serveur et renvoyer les erreurs si besoin
export default async (app) => {
	app.use(async (ctx, next) => {
		try {
            // On attend la fin du process
			await next()
            // Si on a rien à la fin du process
			if (!ctx.status || (ctx.status === 404 && ctx.body === null)) {
                // On va créer nous même une erreur 404
				customThrow(404)
			}
		}
		catch (error) {
			ctx.status = error?.status || error?.statusCode || error?.httpStatusCode || 500
			ctx.body = {
				message : error?.message || http.STATUS_CODES[ctx.status],
				reasons: error?.reasons && Array.isArray(error.reasons) ? error.reasons : [],
			} 
		}
	})
}
