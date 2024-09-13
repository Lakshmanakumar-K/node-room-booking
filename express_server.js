import express from "express";
import roomsRouter from "./routes/rooms.js";
import bookingsRouter from "./routes/bookings.js";
import customersRouter from "./routes/customers.js";

const server = express();

server.use(express.json());

// server.get("/getsample",(req,res)=>{
//     res.json({msg:"verified successfully"});
// })

server.use("/rooms",roomsRouter);
server.use("/bookings",bookingsRouter);
server.use("/customers",customersRouter);

const PORT = 4500;

server.listen(PORT, ()=>{
    console.log("server listening on port 4500");
})