import fs from "fs"
import request from 'supertest'
import app from '#server/index.js'
import { query } from '#server/db.js'

let UUID = null;
let FILEPATH = null;

describe("La route [POST]/convert doit", () => {
    test("Renvoyer une erreur si aucun body n'est associé à la requête", async () => {
		const response = await request(app.callback()).post('/convert')
		expect(response.status).toBe(400);
        const { message, reasons } = JSON.parse(response.text)
		expect(message).toBe("Bad Request")
        expect(reasons).toContain('Vous devez fournir un fichier DOCX')
	});

    test("Renvoyer une erreur si le paramètre webhookUrl est mal formatté", async () => {
		const response = await request(app.callback()).post('/convert').attach('fileToConvert', `${process.env.PWD}/tests/assets/cv.docx`).field('webhookUrl', 'wrong url')
		expect(response.status).toBe(422);
        const { message, reasons } = JSON.parse(response.text)
		expect(message).toBe("Validation échouée")
        expect(reasons).toContain("ConversionRequest.webhookUrl - L'url est invalide")
	});

    test("Renvoyer un résultat positif avec un UUID si tout est correct", async () => {
		const response = await request(app.callback()).post('/convert').attach('fileToConvert', `${process.env.PWD}/tests/assets/cv.docx`)
		expect(response.status).toBe(200);
        const json = JSON.parse(response.text)
        expect(json).toHaveProperty('uuid')
        UUID = json.uuid
        FILEPATH = `${process.env.PWD}/assets/toConvert/${UUID}.docx`
        expect(json).toHaveProperty('fkConversionState')
        expect(json.fkConversionState).toBe(1)
        expect(json).toHaveProperty('originalName')
        expect(json.originalName).toBe('cv.docx')
        expect(fs.existsSync(FILEPATH)).toBe(true)
	});
})

describe("La route [GET]/stats doit", () => {
    test("Renvoyer les statistiques de la base de données", async () => {
        const response = await request(app.callback()).get('/stats')
        const json = JSON.parse(response.text)
        expect(json).toHaveProperty('total')
        expect(json.total).toBeGreaterThanOrEqual(1)
        expect(json).toHaveProperty('tempsMoyen')
        expect(json).toHaveProperty('reussi')
        expect(json).toHaveProperty('echoue')
    })
})

afterAll(() => {
    // Pour ne pas polluer la base on va supprimer l'entrée
    query(`DELETE FROM conversionRequest WHERE _uuid = unhex(replace(:UUID,'-',''))`, { UUID })
    // Et aussi le fichier
    fs.unlinkSync(FILEPATH)
});
