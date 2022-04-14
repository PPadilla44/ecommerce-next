import mongoose from "mongoose";



const connection: { isConnected?: boolean | number } = {};

const connect = async () => {
    if (connection.isConnected) {
        console.log("already connected");
        return;
    }
    if (mongoose.connections.length > 0) {
        connection.isConnected = mongoose.connections[0].readyState;
        if (connection.isConnected === 1) {
            console.log('use previous connection');
            return;
        }
        await mongoose.disconnect();
    }
    if (process.env.MONGODB_URI) {
        const db = await mongoose.connect(process.env.MONGODB_URI)
        console.log('new connection');
        connection.isConnected = db.connections[0].readyState;
    }
}

const disconnect = async () => {
    if (connection.isConnected) {
        if (process.env.NODE_ENV === "production") {
            await mongoose.disconnect();
            connection.isConnected = false;
        } else {
            console.log("not disconnexted");
        }
    }
}

const db = { connect, disconnect };
export default db;