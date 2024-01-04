const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let bucket;

async function dbconnection() {
    if (mongoose.connection.readyState === 1) {
        console.log("Already connected");

        if (bucket) {
            return { connection: mongoose.connection, bucket };
        }

        bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: "Arquivos",
        });

        return { connection: mongoose.connection, bucket };
    }

    console.log("Connecting to db...");

    return await mongoose.connect(process.env.DB_CONNECTION_STRING, {
        dbName: "starmap",
    }).then(() => {
        console.log("Connected");

        mongoose.connection.on("disconnected", () => {
            console.log("Disconnected");
        });

        bucket = new GridFSBucket(mongoose.connection.db, {
            bucketName: "Arquivos",
        });

        return { connection: mongoose.connection, bucket };
    });
}

module.exports = dbconnection;
