import express from "express";
import { customers } from "./local-memory.js"
import { v4 } from "uuid"

const customersRouter = express.Router();

// 4. To list all customers with booked data
customersRouter.get("/", (req, res) => {
    res.json(customers);
});

// To create a customer
// Need to passed as array
customersRouter.post("/", (req, res) => {
    let custs = req.body;
    custs.forEach((customer) => {
        customers.push({ customer_id: v4(), ...customer, no_of_bookings: 0, booking_ids: [], bookings_date: [] })
    });
    res.json({ msg: "customer Added successfully" })
});

// 5. To find how many times an individual customer has booked and booking details
customersRouter.get("/:cust_id", (req, res) => {
    let cust_id = req.params.cust_id;
    let customer= customers.find((cu) => cu.customer_id == cust_id);
    if (customer) {
        res.json(customer);
    }
    else {
        res.json({ msg: "customer not found" });
    }
});

// To update customer details
// Customer ID need to passed in body
customersRouter.put("/update",(req,res)=>{
    let customer = req.body;
    let customerIndex = customers.findIndex((cust)=>cust.customer_id == customer.customer_id);
if(customerIndex == -1){
    res.json({msg:"customer not found"})
}
else{
    customers[customerIndex] = {...customers[customerIndex],...customer};
    res.json({msg:"Customer details updated successfully"});
}
});

export default customersRouter;