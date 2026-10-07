const mongoose = require("mongoose");
const env = require("./env");

mongoose.set("strictQuery" , true);

async function connectDB(){
    let conn;
    try {
        conn = await mongoose.connect(env.mongoUri , {
            serverSelectionTimeoutMS: 10_000
        });
    } catch (err) {
        // Surface the per-server reason (DNS failure, TLS, refused...) — the
        // top-level message always blames the IP allow-list.
        for (const [host, s] of err.reason?.servers ?? []) {
            if (s.error) console.error(`[db] ${host}: ${s.error.code || s.error.name}: ${s.error.message}`);
        }
        if (err.cause) console.error("[db] cause:", err.cause.code || err.cause.message);
        throw err;
    }
    console.log(`MongoDb connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on("error" , (err) => {
        console.error("mongoose error:" , err.message);
    });
    mongoose.connection.on("disconnected" , () => {
        console.warn("MongoDB disconnected");
    });
}

module.exports = { connectDB };