import { customThrow } from "#utils/Helpers.js"
import ValidatorParser from "#utils/ValidatorParser.js"

export default class Model {

    _errors = []

    hydrate(data, model, withName = true) {
        for ( let key in model ) {
            const { type, options } = model[key]
            const value = data[key]

            try {
                this[key] = ValidatorParser[type](value, options)
            } catch(error) {
                this._errors.push(`${this.constructor.name}.${key} - ${error.message}`)
            }
        }
        this.checkModel()
    }

    checkModel() {
        if(this._errors.length > 0) customThrow(422, "Validation échouée", this._errors)
    }
}