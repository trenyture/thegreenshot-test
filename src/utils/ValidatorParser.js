/**
 * Cette classe nous permet de créer des validateurs custom pour savoir si les paramètres passés dans les requêtes sont valides
 * Elle permet aussi de les parser et donc de ne pas avoir à jongler avec des strings
 * j'ai mis des exemples qui ne sont pas forcément utiles pour ce projet, mais c'est plus pour illustrer les possibilités de cette classe
 */
import { formatDate } from "./Helpers.js"

const regexs = {
	email : /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	uuid : /^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/,
	/* Dans le cas des URL on va être laxiste et permettre du "localhost" si on est pas en production */
	url: process.env.ENVIRONMENT !== "production"
		? /^(https?:\/\/)?(localhost|[a-zA-Z0-9.-]+)(:[0-9]{1,5})?(\/[^\s]*)?$/ 
		: /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/,
}

const ValidatorParser = {

    isNull : function(value, emptyAsNull = true) {
		return typeof value === 'undefined' || value === null || value === 'null' || (emptyAsNull && value.toString().replace(/\s/g, '').length === 0)
	},

	text: function (value, options = {}) {
		let error = new Error()

		if (this.isNull(value, options.emptyAsNull)) {
			error.message = "Le texte est obligatoire"
			if (options.canBeNull) return null
			throw error
		}
		if (options.regex && !options.regex.test(value)) {
			error.message = options.regexErrorMessage || "Le texte est invalide"
			throw error
		}
		if (typeof options.maxLength !== "undefined" && value.length >= options.maxLength) {
			error.message = `Le texte doit faire moins de ${options.maxLength} caractère${options.maxLength > 1 ? "s" : ""}`
			throw error
		}
		if (typeof options.minLength !== "undefined" && value.length <= options.minLength) {
			error.message = `Le texte doit faire plus de ${options.minLength} caractère${options.minLength > 1 ? "s" : ""}`
			throw error
		}

		return value
	},

    date : function(value, options = {}) {

		let error = new Error()

		if (this.isNull(value)) {
			if (options.canBeNull) return null
			error.message = "La date est obligatoire"
			throw error
		}
		const date = new Date(value)
		if (isNaN(date.getTime())) {
			error.message = "La date est invalide."
			throw error
		}
		if (options.maxValue instanceof Date && date.getTime() >= options.maxValue.getTime()) {
			error.message = `La date doit être inférieure à ${ formatDate(options.maxValue) }.`
			throw error
		}
		if (options.minValue instanceof Date && date.getTime() <= options.minValue.getTime()) {
			error.message = `La date doit être supérieure à ${ formatDate(options.minValue) }.`
			throw error
		}

		return date
	},

	integer : function(value, options = {}) {
		let error = new Error()

		//Convert to Int
		const num = Number.parseInt(value)
		if (isNaN(num)) {
			if (options.canBeNull) return null
			error.message = "Le nombre entier est obligatoire"
			throw error
		}

		if (typeof options.maxValue !== 'undefined' && num >= options.maxValue) {
			error.message = `Le nombre doit être inférieur à ${options.maxValue}`
			throw error
		}
		if (typeof options.minValue !== 'undefined' && num <= options.minValue) {
			error.message = `Le nombre doit être supérieur à ${options.minValue}`
			throw error
		}

		return num
	},

	decimal : function(value, options = {}) {
		let error = new Error()

		//Convert to Float en fonction du nombre de décimales souhaitées (par défaut 2)
		const precision = Math.pow(10, typeof options.decimals !== 'undefined' ? options.decimals : 2)
		const num = Math.round(Number.parseFloat(value) * precision) / precision

		if (isNaN(num)) {
			if (options.canBeNull) return null
			error.message = "Le nombre décimal est obligatoire"
			throw error
		}
		if (typeof options.maxValue !== 'undefined' && num >= options.maxValue) {
			error.message = `Le nombre doit être inférieur à ${options.maxValue}`
			throw error
		}
		if (typeof options.minValue !== 'undefined' && num <= options.minValue) {
			error.message = `Le nombre doit être supérieur à ${options.minValue}`
			throw error
		}

		return num
	},

	email : function(value, options = {}) {
		if (typeof value === "string") value = value.toLowerCase().trim()
		return this.text(value, { ...options, regex: regexs.email, regexErrorMessage: "L'email est invalide" })
	},

	uuid : function(value, options = {}) {
		return this.text(value, { ...options, regex: regexs.uuid, regexErrorMessage: "L'UUID est invalide" })
	},

	url : function(value, options = {}) {
		return this.text(value, { ...options, regex: regexs.url, regexErrorMessage: "L'url est invalide" })
	},
}

export default ValidatorParser;