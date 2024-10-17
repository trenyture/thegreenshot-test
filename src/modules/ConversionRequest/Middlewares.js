import { assert } from "#utils/Helpers.js"
import ValidatorParser from "#utils/ValidatorParser.js"

export const creation = (ctx, next) => {

    // Il faut qu'on reçoive bien un fichier DOCX
    assert(ctx.request.files?.fileToConvert?.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" , 400, "Bad Request", "Vous devez fournir un fichier DOCX")

    return next()
}