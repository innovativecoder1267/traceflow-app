import mongoose from "mongoose";

interface DatabaseConnection{
    isconnected:number
}

const connection:DatabaseConnection={isconnected:0}

export const DbConnection =async()=>{
    if(connection.isconnected){
        console.log("Already connected to database")
        return;
    }
    try {
       const mongodburi=process.env.MONGO_URI as string
        const Dbconnection= await mongoose.connect(mongodburi)
       connection.isconnected=Dbconnection.connections[0].readyState
       if(!Dbconnection.connections[0].readyState){
        console.log("Failed to connect to database")
        process.exit(1);
       }
    } catch (error) {
        console.log("Database connection error",error)
        process.exit(1);
    }
}