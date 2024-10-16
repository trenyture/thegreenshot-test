import Router from 'koa-router'

const router = new Router()

router.get("/", async ctx => {
    ctx.body = "Bienvenue sur cette API"
})

export default router