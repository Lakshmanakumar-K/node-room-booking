import express from "express";
import { rooms } from "./local-memory.js";
import { v4 } from "uuid";

const roomsRouter = express.Router();

// To get list of rooms
roomsRouter.get("/",(req,res)=>{
res.json(rooms);
});

// 1. To create rooms - Array of room details need to be passed to create room
roomsRouter.post("/",(req,res)=>{
const rms = req.body;
rms.forEach((room)=>{
    rooms.push({room_id: v4(),...room, bookings_date:[]});
});
res.json({msg:"rooms created successfully"});
//res.json(rooms);
});

// To get single room details
roomsRouter.get("/:room_id",(req,res)=>{
let room_id = req.params.room_id;
let room = rooms.find((rm)=>rm.room_id == room_id);
if(room){
    res.json(room);
}
else{
    res.json({msg:"room not found"});
}
});

export default roomsRouter;