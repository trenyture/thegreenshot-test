import * as ConversionRequestScripts from "#modules/ConversionRequest/Scripts.js";
import { CronJob } from "cron"

new CronJob('0 * * * * *', () => {
    ConversionRequestScripts.convert();
}, null, true);