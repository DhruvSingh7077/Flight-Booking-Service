const {StatusCodes} = require('http-status-codes')
const {BookingService} = require('../services');
const {SuccessResponse,ErrorResponse} = require('../utils/common');

const inMemDb = {};

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
async function makePayment(req,res) {
  try{
    const idempotencyKey = req.headers['x-idempotency-key'];
    if(!idempotencyKey) {
      return res
       .status(StatusCodes.BAD_REQUEST)
      .json({message: 'idempotency key missing'})
    }
    if(!idempotencyKey || inMemDb[idempotencyKey]){
       return res
      .status(StatusCodes.BAD_REQUEST)
      .json({message: 'Cannot retry on a successful payment'});
    }
    const response = await BookingService.makePayment({
      totalCost: req.body.totalCost,
     userId: req.body.userId,
     bookingId: req.body.bookingId
    });
    inMemDb[idempotencyKey] = idempotencyKey;
    return res
      .status(StatusCodes.OK)
      .json(SuccessResponse(response));
  } catch(error) {
    

    return res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json(ErrorResponse(error));
  }
}
module.exports = {
    createBooking,
    makePayment
};
