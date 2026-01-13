const { StatusCodes } = require("http-status-codes");
const { Booking } = require("../models");
// completed the booking repository status 
class BookingRepository extends CrudRepository {
  constructor() {
    super(Booking);
  }
}
module.exports = BookingRepository;
