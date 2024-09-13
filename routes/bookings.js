import express from "express";
import { bookings, rooms, customers } from "./local-memory.js"
import { v4 } from "uuid";

const bookingsRouter = express.Router();

// To get list of bookings
// 3. To list all rooms with booked data
bookingsRouter.get("/", (req, res) => {
    res.json(bookings);
});

// 2. To book a room based on availability
bookingsRouter.post("/", (req, res) => {

    // Getting customer details and booking start and end time details in request body
    const { customer_name, no_of_occupants, email, phone, start_date, start_month, start_year, start_hour, start_min,
        end_date, end_month, end_year, end_hour, end_min
    } = req.body;

    const customer_booking_start = `${start_year}/${start_month}/${start_date},${start_hour}:${start_min}`;
    const customer_booking_end = `${end_year}/${end_month}/${end_date},${end_hour}:${end_min}`;

    // To create a new customer or fetching details of existing customer
    // Both email and phone no should be different for creating new customer
    let cust = customers.find((customer) => customer.customer_email == email || customer.customer_phone == phone)
    if (!cust) {
        customers.push({ customer_id: v4(), customer_name, customer_email: email, customer_phone: phone, no_of_bookings: 0, booking_ids: [], bookings_date: [] });
        cust = customers[customers.length - 1];
        console.log(cust);
    }

    // room allocation
    // rooms matching based on no of occupants requested by customer
    const rooms_matching_condition = rooms.filter((room) => {
        if (room.max_no_of_occupants >= no_of_occupants) {
            return room;
        }
    });

    console.log(rooms_matching_condition);

    // Finding rooms which are not booked even a single time 
    if (rooms_matching_condition.length == 0) {
        res.json({ msg: "Room not available" });
    }
    else {
        let not_booked_rooms = [];
        if (bookings.length == 0) {
            not_booked_rooms = rooms_matching_condition;
        }
        else {
            not_booked_rooms = [];
            rooms_matching_condition.forEach((room) => {
                let cnt = 0;
                bookings.forEach((booking) => {
                    if (room.room_no == booking.room_no) {
                        cnt = cnt + 1;
                    }
                });
                if (cnt == 0) {
                    not_booked_rooms.push(room);
                }
            });
        }

        console.log(not_booked_rooms);

        // After getting list of rooms which are not booked for single time, allocating 1st element(room) in list(not_booked_rooms) to a customer
        // After allocating, updating both customer and room details 
        if (not_booked_rooms.length > 0) {
            let booking_id = v4();

            // Updating booking details
            bookings.push({
                booking_id, room_id: not_booked_rooms[0].room_id, room_no: not_booked_rooms[0].room_no,
                max_no_of_occupants: not_booked_rooms[0].max_no_of_occupants, amenities: not_booked_rooms[0].amenities
                , price_per_hour: not_booked_rooms[0].price_per_hour, booked_from: customer_booking_start, booked_upto: customer_booking_end,
                customer_id: cust.customer_id,customer_name: cust.customer_name
            })

            // Updating customer details
            // Since cust variable and customer array holds reference to object, updating cust variable reflects changes in customer array
            cust.no_of_bookings += 1;
            cust.bookings_date.push(`${customer_booking_start} to ${customer_booking_end}`);
            cust.booking_ids.push(booking_id);

            /* //console.log(bookings_count + " " + bks_date + " " + bks_ids);
            //let custIndex = customers.findIndex((customer)=> customer.customer_id == cust.customer_id);
            //console.log(customers);
            //customers[custIndex]={...customers[custIndex],no_of_bookings:bookings_count,booking_ids:bks_ids,bookings_date:bks_date}; */

            // Updating room details
            // Since rm variable and rooms array holds reference to object, updating rm variable reflects changes in rooms array
            let rm = rooms.find((room) => room.room_id == not_booked_rooms[0].room_id);
            rm.bookings_date.push(`${customer_booking_start} to ${customer_booking_end}`);
            res.json({ msg: "room booked successfully" });
        }
        // If all rooms are booked then by comparing timestamp rooms will get allocated
        else {
            let booking_done = false;
            rooms_matching_condition.forEach((room) => {
                if (!booking_done) {
                    bookings.forEach((booking) => {
                        if (!booking_done) {
                            if (room.room_no == booking.room_no) {
                                const rm_bk_st_tm = new Date(booking.booked_from).getTime();
                                const rm_bk_ed_tm = new Date(booking.booked_upto).getTime();
                                const cus_bk_start_tm = new Date(customer_booking_start).getTime();
                                const cus_bk_end_tm = new Date(customer_booking_end).getTime();

                                // customer booking start timestamp should less than customer booked end timestamp
                                // Customer booking start timestamp should greater than already booked rooms end timestamp (or)
                                // customer booking end timestamp should less than already booked rooms start timestamp
                                if ((cus_bk_start_tm > rm_bk_ed_tm && cus_bk_end_tm > cus_bk_start_tm) || (cus_bk_end_tm < rm_bk_st_tm && cus_bk_start_tm < cus_bk_end_tm)) {

                                    // Iterate through bookings and checking whether same room is allocated for same timestamp already
                                    let result = bookings.find((booking) => (booking.room_no == room.room_no && booking.booked_from == customer_booking_start && booking.booked_upto == customer_booking_end));
                                    console.log(result);
                                    if (!result) {
                                        let booking_id = v4();
                                        bookings.push({
                                            booking_id, room_id: room.room_id, room_no: room.room_no,
                                            max_no_of_occupants: room.max_no_of_occupants, amenities: room.amenities,
                                            price_per_hour: room.price_per_hour, booked_from: customer_booking_start, booked_upto: customer_booking_end,
                                            customer_id: cust.customer_id,customer_name: cust.customer_name,
                                        });
                                        booking_done = true;

                                        //Updating customer details
                                        // Since cust variable and customer array holds reference to object, updating cust variable reflects changes in customer array
                                        cust.no_of_bookings += 1;
                                        cust.bookings_date.push(`${customer_booking_start} to ${customer_booking_end}`);
                                        cust.booking_ids.push(booking_id);

                                        // Updating room details
                                        // Since rm variable and rooms array holds reference to object, updating rm variable reflects changes in rooms array
                                        let rm = rooms.find((rm) => rm.room_id == room.room_id);
                                        rm.bookings_date.push(`${customer_booking_start} to ${customer_booking_end}`);
                                        res.json({ msg: "room booked successfully" });
                                    }
                                }
                            }
                        }
                    });
                }
            });
            if (!booking_done) {
                res.json({ msg: "Rooms are not available at specified date and time" })
            }
        }

    }

});



export default bookingsRouter;