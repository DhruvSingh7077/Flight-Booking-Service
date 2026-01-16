const {StatusCodes} = require('http-status-codes')
const {BookingService} = require('../services');
const {SuccessResponse,ErrorResponse} = require('../utils/common')
async function createBooking(req,res) {
  try{
    const response = await BookingService.createBooking({
      flightId: req.body.flightId,
     userId: req.body.userId,
     noofSeats: req.body.noofSeats
    });
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(response));
  } catch(error) {
    console.error("UPDATE SEATS ERROR:", error);

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
}
module.exports = {
    createBooking
};
