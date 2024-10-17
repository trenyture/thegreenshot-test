import fs from 'fs'
import { v4 as uuidV4} from 'uuid'
import { ConversionRequest } from "./Models.js"
import { CONVERSION_STATE } from "#modules/ConversionState/Models.js"
import * as ConversionRequestManager  from './Manager.js';

export const retrieve = async ({uuid = null, fkConversionState = null} = {}) => {
    return ConversionRequestManager.get({uuid, fkConversionState})
}

export const create = async (conversionRequest, docxToConvert) => {
    conversionRequest.uuid = uuidV4().toUpperCase();

    // On va mettre le fichier dans le dossier à traiter 
    fs.writeFileSync(`${process.env.PWD}/assets/toConvert/${conversionRequest.uuid}.docx`, fs.readFileSync(docxToConvert.path))

    conversionRequest.fkConversionState = CONVERSION_STATE.EN_ATTENTE
    conversionRequest.originalName = docxToConvert.name
    conversionRequest.createdDate = new Date()

    // On enregistre en base
    await ConversionRequestManager.set(new ConversionRequest(conversionRequest))

    return conversionRequest
}


export const retrieveStats = async () => {
    const requests = await retrieve();

    const {totalTime, failed, treated} = requests.reduce((accumulator, request) => {
        if(request.fkConversionState === CONVERSION_STATE.TERMINE) {
            accumulator.totalTime += (request.convertedDate - request.createdDate) / 1000
            accumulator.treated += 1
        }
        else if(request.fkConversionState === CONVERSION_STATE.ERREUR) accumulator.failed += 1
        return accumulator
    }, {
        totalTime: 0,
        failed: 0,
        treated: 0
    })

    return {
        total: requests.length,
        tempsMoyen: `${(totalTime / (treated || 1)).toFixed(2)} secondes`,
        reussi: `${(treated / requests.length * 100).toFixed(2)} %`,
        echoue: `${(failed / requests.length * 100).toFixed(2)} %`,
    }
}