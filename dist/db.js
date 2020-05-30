import { default as mongodb } from 'mongodb';
import * as config from '../config.js';
// db setup
let db;
const MongoClient = mongodb.MongoClient;
const client = new MongoClient(config.dbUrl, {
    auth: { user: config.dbUser, password: config.dbPassword },
    useUnifiedTopology: true
});
async function getDb() {
    if (!db) {
        try {
            await client.connect();
            console.log("Connected successfully to server");
            return await client.db(config.dbName);
        }
        catch (e) {
            throw e;
        }
    }
    else {
        return db;
    }
}
export default getDb;
