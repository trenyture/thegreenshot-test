/**
 * Fonction qui prend un objet date et là retourne au format YYYY-MM-DD hh:mm:ss
 * @param {Date} date 
 * @returns string
 */
export const formatDate = (date) => date.toISOString().replace("T", " ").substring(0, 19)

/**
 * Fonction qui prend un nombre décimal et le renvoie en entier
 * Parfait pour transformer un prix en un prix en centimes
 * Cela permet surtout d'éviter de faire par exemple 9.70*100 = 969.9999999999999, cela renverra bien 970
 * @param {Number} value prix à virgule
 * @param {Number} decimals nombre de chiffres pour les centimes
 * @returns Number le prix en centimes
 */
export const convertToCents = (value, decimals = 2) => {
    const precision = Math.pow(10, decimals)
    return parseInt((value * precision).toFixed(decimals))
}

// On créée un throw personnalisé qui permet d'ajouter des détails aux erreurs
export const customThrow = (status, message, reasons) => {
	if(reasons != null && !(reasons instanceof Array)) reasons = [ reasons ]
	throw Object.assign(new Error(message), { status, reasons })
}

// On créée une fonction d'assertion pour pouvoir simplifier la gestion de validations
export const assert = (condition, status, message, reasons) => {
	if ( !condition ) customThrow(status, message, reasons)
}