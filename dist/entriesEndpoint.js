import { MongoDBQuery } from '@lsys/projectData/esm/Misc/MongoDB';
import { deleteImage, handleUpdateImages } from './imageStorage.js';
export default async function getEntriesEndpointConfig(db, entriesCollection) {
    //const entriesCollection = await db.collection('entries');
    return {
        query: new MongoDBQuery(db, { collection: 'entries', query: {} }),
        id: (e) => e.id,
        filter: (e, req) => {
            if (e.private) {
                if (req.user)
                    return e;
                else
                    return;
            }
            return e;
        },
        add: async (obj, req) => {
            console.log("add entry user: ", req.user);
            if (!req.user)
                return;
            entriesCollection.insertOne(obj).catch(err => {
                console.log("Error writing entry to db: ", err);
            });
        },
        delete: async (obj, req) => {
            if (!req.user)
                return;
            console.log("DELETE");
            // backwards compat.
            if (obj.images) {
                for (const image of obj.images) {
                    deleteImage(image);
                }
            }
            entriesCollection.deleteOne({ id: obj.id }).catch(err => {
                console.log("Error deleting entry from db: ", err);
            });
        },
        update: async (newObj, oldObj, req) => {
            if (!req.user)
                return;
            console.log("UPDATE");
            // handle images
            if (!newObj.images)
                newObj.images = [];
            if (!oldObj.images)
                oldObj.images = [];
            handleUpdateImages(newObj.images, oldObj.images);
            // remove fields that are not to update, _id cannot update
            delete newObj._id;
            delete newObj.id;
            delete newObj.date;
            entriesCollection.updateOne({ id: oldObj.id }, { $set: newObj })
                .catch(err => {
                console.log("Error updating entry in db: ", err);
            });
        }
    };
}
