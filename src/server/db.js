import { customThrow } from '#utils/Helpers.js';
import 'dotenv/config'
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    namedPlaceholders: true,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});


export const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results
    } catch (error) {
        customThrow(503, "Service Unavailable", error)
	}
}