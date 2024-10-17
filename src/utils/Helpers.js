/**
 * Fonction qui prend un objet date et là retourne au format YYYY-MM-DD hh:mm:ss
 * @param {Date} date 
 * @returns string
 */
export const formatDate = (date) => date.toISOString().replace("T", " ").substring(0, 19)

// On créée un throw personnalisé qui permet d'ajouter des détails aux erreurs
export const customThrow = (status, message, reasons) => {
	if(reasons != null && !(reasons instanceof Array)) reasons = [ reasons ]
	throw Object.assign(new Error(message), { status, reasons })
}

// On créée une fonction d'assertion pour pouvoir simplifier la gestion de validations
export const assert = (condition, status, message, reasons) => {
	if ( !condition ) customThrow(status, message, reasons)
}