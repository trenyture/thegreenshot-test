import Router from 'koa-router'
import { join, resolve } from 'path'
import fs from 'fs'

/**
 * On créée une fonction récursive qui va scanner nos modules à la recherche de Router
 * Et qui va les inclure automatiquement sans qu'on ait à le faire nous même
 *
 * ⚠️ Chaque route sera préfixée par le nom du module en question
 * ex : ./modules/User/Router.js va créer les routes [GET|POST|...] /user/*
 * ex2 : ./modules/User/Rights/Router.js va créer les routes [GET|POST|...] /user/rights/*
 */
async function scanDirForRouters (mainRouter, dirPath, name = []) {
	// On fait la liste de tout ce qu'il y a dans le dossier 
    const files = fs.readdirSync(dirPath)
	// Pour chaque chose on va
    for(const file of files) {
        // Regarder si c'est un répertoire
		const isDirectory = await fs.statSync(join(dirPath, file)).isDirectory()
		if(isDirectory) {
            // Dans ce cas on va relancer la fonction récursivement
			await scanDirForRouters(mainRouter, join(dirPath, file), [...name, file])
		}
        // Sinon si c'est un fichiers "Router.js"
		else if(file === "Router.js") {
            // On l'importe
			const router = (await import(`${join(dirPath, file)}`)).default
            // et on l'associe au router global
			mainRouter.use(`/${ name.join("/").toLowerCase() }`, router.routes(), router.allowedMethods())
		}
	}
}

// Puis on créé la fonction qui va initialiser tout ça
export default async (app) => {
	const router = new Router()

	await scanDirForRouters(router, join(resolve(), "src", "modules"))

	app.use(router.routes()).use(router.allowedMethods())
}