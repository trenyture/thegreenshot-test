import fs from 'fs'
import axios from "axios"
import { convert as libreOfficeConvert } from 'libreoffice-convert'
import { CONVERSION_STATE } from "#modules/ConversionState/Models.js"
import * as ConversionRequestManager from "#modules/ConversionRequest/Manager.js"

const semaphore = `${process.env.PWD}/assets/.semaphore`

// Cette fonction est à exécuter lors du lancement du server, au cas où celui-ci ait été stoppé alors qu'un job était en cours...
export const unconvert = async () => {
    // On vérifie qu'il y a bel et bien déjà un JOB en cours
    if(fs.existsSync(semaphore)) {
        // On va chercher tous les JOBS en traitement
        const pendingConversionRequests = await ConversionRequestManager.get({ fkConversionState: CONVERSION_STATE.EN_COURS })
        // On les repasse à En Attente
        if(pendingConversionRequests?.length > 0) {
            // Pour chacune des requêtes
            await Promise.all(pendingConversionRequests.map(async (conversionRequest) => {
                // On les repasse en attente
                conversionRequest.fkConversionState = CONVERSION_STATE.EN_ATTENTE
                await ConversionRequestManager.set(conversionRequest)
                return true
            }))
        }
        // On supprime le sémaphore
        fs.unlinkSync(semaphore)
        return true;
    }
}

export const convert = async () => {
    // On vérifie qu'il n'y a pas déjà un JOB en cours
    if(fs.existsSync(semaphore)) return false

    // On va chercher le premier JOB "En Attente"
    const waitingConversionRequests = await ConversionRequestManager.get({ fkConversionState: CONVERSION_STATE.EN_ATTENTE })

    if(!waitingConversionRequests || waitingConversionRequests.length === 0) return false

    // On créer le sémaphore pour bloquer les prochaines requêtes
    fs.writeFileSync(semaphore,'');

    const conversionRequest = waitingConversionRequests[0]
    // On le passe au statut En cours
    conversionRequest.fkConversionState = CONVERSION_STATE.EN_COURS
    await ConversionRequestManager.set(conversionRequest)

    try {
        const docxBuf = fs.readFileSync(`${process.env.PWD}/assets/toConvert/${ conversionRequest.uuid }.docx`);
        const pdfBuf = await new Promise((resolve, reject) => {
            libreOfficeConvert(docxBuf, ".pdf", undefined, (err, data) => {
                if(err) return reject(err)
                return resolve(data)
            })
        })
        fs.writeFileSync(`${process.env.PWD}/assets/converted/${ conversionRequest.uuid }.pdf`, pdfBuf);
        conversionRequest.fkConversionState = CONVERSION_STATE.TERMINE
        conversionRequest.convertedDate = new Date();

        if(conversionRequest.webhookUrl) {
            const hostname = process.env.HOSTNAME || "localhost"
            const port = process.env.PORT || 3000
            axios.post(conversionRequest.webhookUrl, {
                pdfUrl: `http://${hostname}:${port}/asset/${conversionRequest.uuid}`
            }).then(function (response) {
                // console.log(response);
                console.log(conversionRequest.webhookUrl + " CALLED")
            })
            .catch(function (error) {
                console.log(error);
            });
        }
    } catch(err) {
        console.log(err)
        conversionRequest.fkConversionState = CONVERSION_STATE.ERREUR
    }
    
    await ConversionRequestManager.set(conversionRequest)

    // On supprime le sémaphore
    fs.unlinkSync(semaphore)
    return true;
}