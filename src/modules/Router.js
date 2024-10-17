import fs from 'fs'
import Router from 'koa-router'
import { assert } from '#utils/Helpers.js'
import * as ConversionRequestMiddlewares from "#modules/ConversionRequest/Middlewares.js"
import * as ConversionRequestController from "#modules/ConversionRequest/Controller.js"
import { CONVERSION_STATE } from '#modules/ConversionState/Models.js'

const router = new Router()

router.get("asset/:uuid", async (ctx, next) => {
    const { uuid } = ctx.params

    const conversionRequest = (await ConversionRequestController.retrieve({uuid, fkConversionState: CONVERSION_STATE.TERMINE}))?.[0]
    const filename = `${process.env.PWD}/assets/converted/${uuid}.pdf`
    assert(!!conversionRequest && fs.existsSync(filename), 404, "Not found")
    
    ctx.set("content-Disposition", `attachment; filename="${ conversionRequest.originalName }.pdf"`)
    ctx.set("content-Type", 'application/pdf')
    ctx.body = fs.createReadStream(filename)
})

router.get("stats", async ctx => {
    ctx.body = await ConversionRequestController.retrieveStats();
})

router.post("convert", ConversionRequestMiddlewares.creation, async (ctx) => {
    const { webhookUrl } = ctx.request.body
    const { fileToConvert } = ctx.request.files
    ctx.body = await ConversionRequestController.create({ webhookUrl }, fileToConvert)
})

router.post("test", async ctx => {
    console.log(ctx.request.body)
    ctx.body = true
})


export default router