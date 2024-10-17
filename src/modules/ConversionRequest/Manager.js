import { query } from "#server/db.js"

export const get = async ({
    uuid = null,
    fkConversionState = null,
} = {}) => {
    const sql = `
        SELECT
            uuid,
            originalName,
            fkConversionState,
            webhookUrl,
            createdDate,
            convertedDate
        FROM conversionRequest
        WHERE 1
        ${ uuid !== null ? "AND _uuid = unhex(replace(:uuid,'-',''))" : ""}
        ${ fkConversionState !== null ? "AND fkConversionState = :fkConversionState" : "" }
        ORDER BY createdDate ASC
    `
    const params = { uuid, fkConversionState }
    return query(sql, params)
}

export const set = async (conversionRequest) => {
    const sql = `
        INSERT INTO conversionRequest (
            _uuid,
            originalName,
            fkConversionState,
            webhookUrl,
            createdDate,
            convertedDate
        ) VALUES (
            unhex(replace(:uuid,'-','')),
            :originalName,
            :fkConversionState,
            :webhookUrl,
            :createdDate,
            :convertedDate
        ) ON DUPLICATE KEY UPDATE
            originalName = VALUES( originalName ),
            fkConversionState = VALUES( fkConversionState ),
            webhookUrl = VALUES( webhookUrl ),
            convertedDate = VALUES( convertedDate );
    `
    return query(sql, conversionRequest)
}