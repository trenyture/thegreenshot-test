import { query } from "#/server/db.js"

export const retrieve = ({
    id = null,
    label = null,
} = {}) => {
    const sql = `
        SELECT *
        FROM conversionState
        WHERE 1
        ${ id !== null ? "AND conversionState.id = :id" : ""}
        ${ label !== null ? "AND conversionState.label = :label" : ""}
    `
    const params = { id, label }
    return query(sql, params)
}