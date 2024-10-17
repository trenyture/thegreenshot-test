import Model from "#utils/Model.js"

export const CONVERSION_STATE = {
    EN_ATTENTE: 1,
	EN_COURS: 2,
	TERMINE: 3,
	ERREUR: 4,
}

export class ConversionState extends Model {
    _model = {
        id: { type: "integer", options: { minValue: 0 } },
        label: { type: "text", options: { maxLength: 50 } }
    }

    constructor(data) {
        super()
        this.hydrate(data)
    }

    hydrate(data) {
        super.hydrate(data, this._model)
    }
}