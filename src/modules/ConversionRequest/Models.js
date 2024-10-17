import Model from "#utils/Model.js"

export class ConversionRequest extends Model {
    _model = {
        uuid: { type: "uuid" },
        originalName: { type: "text", options: { maxLength: 180 } },
        fkConversionState: { type: "integer", options: { minValue: 0 } },
        webhookUrl: { type: "url", options: { canBeNull: true } },
        createdDate: { type: "date" },
        convertedDate: { type: "date", options: { canBeNull: true } }
    }

    constructor(data) {
        super()
        this.hydrate(data)
    }

    hydrate(data) {
        super.hydrate(data, this._model)
    }
}