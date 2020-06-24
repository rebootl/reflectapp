import bcrypt from 'bcrypt';
import { MongoDBQuery } from '@lsys/projectData/esm/Misc/MongoDB';
// (from stackoverflow)
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}
export default async function getUseEndpointConfig(db) {
    const usersCollection = await db.collection('users');
    return {
        query: new MongoDBQuery(db, { collection: 'users', query: {} }),
        id: (e) => e.id,
        filter: (e, req) => {
            if (!req.user)
                return undefined;
            return req.user.name === e.name ? e : undefined;
        },
        add: async (obj, req) => {
            if (req.user)
                return;
            console.log("CREATE user: ");
            // check if username already exists
            if (usersCollection.findOne({ name: obj.name }))
                return;
            // check username
            // - length, allowed characters
            if (obj.name.length > 20)
                return;
            if (!obj.name.match(/^[0-9a-z]+$/))
                return;
            // check mail address
            if (!validateEmail(obj.email))
                return;
            // create pwhash
            obj.pwhash = bcrypt.hashSync(obj.password, 10);
            delete obj.password;
            // set user inactive maybe
            obj.active = false;
            usersCollection.insertOne(obj).catch(err => {
                console.log("Error writing entry to db: ", err);
            });
        },
        delete: async (obj, req) => {
            if (!req.user && req.user.name === obj.name)
                return;
            console.log("DELETE user");
            // -> delete all user data
            usersCollection.deleteOne({ name: req.user.name }).catch(err => {
                console.log("Error deleting entry from db: ", err);
            });
        },
        update: async (newObj, oldObj, req) => {
            if (!req.user && req.user.name === oldObj.name)
                return;
            if (oldObj.name !== newObj.name)
                return;
            console.log("UPDATE user");
            usersCollection.updateOne({ name: oldObj.name }, { $set: newObj })
                .catch(err => {
                console.log("Error updating entry in db: ", err);
            });
        }
    };
}
