const axios = require('axios');

const {ServerConfig} = require('../config')
const {BookingRepository} = require('../repositories');
const db = require('../models');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const { Enums } = require("../utils/common");
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;
const bookingRepository = new BookingRepository()

async function createBooking(data) {
     const transaction = await db.sequelize.transaction();
        try {
    const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
    const flightData = flight.data.data;
     if(data.noofSeats > flightData.totalSeats) {
        // throw {message: 'No of seats exceeds available seat'}
        throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST)
     }
     const totalBillingAmount = data.noofSeats * flightData.price;
     const bookingPayload = {...data, totalCost:totalBillingAmount};
     const booking = await bookingRepository.create(bookingPayload, transaction);
     try {
     await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
        seats: data.noofSeats
     });
   } catch (err) {
      await transaction.rollback();
      throw new AppError("Seat update failed", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    await transaction.commit();
    return booking;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
       
  async function makePayment(data) {
  const transaction = await db.sequelize.transaction();
  try {
    // ✅ FIX 1: convert types
    data.bookingId = Number(data.bookingId);
    data.userId = Number(data.userId);
    data.totalCost = Number(data.totalCost);

    const bookingDetails = await bookingRepository.get(
      data.bookingId,
      transaction
    );
    if(bookingDetails.status == CANCELED) {
           throw new AppError('the booking has expired ', StatusCodes.BAD_REQUEST);
    }

    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    if(currentTime - bookingTime > 300000) {
        await bookingRepository.update(data.bookingId, {status: CANCELLED}, transaction)
        throw new AppError('the booking has expired ', StatusCodes.BAD_REQUEST);
    }
    // ✅ FIX 2: correct comparison + message
    if (bookingDetails.totalCost !== data.totalCost) {
      throw new AppError(
        'Payment amount mismatch',
        StatusCodes.BAD_REQUEST
      );
    }

    if (bookingDetails.userId !== data.userId) {
      throw new AppError(
        'The user corresponding to the booking does not match',
        StatusCodes.BAD_REQUEST
      );
    }

    await bookingRepository.update(
      data.bookingId,
      { status: BOOKED },
      transaction
    );

    await transaction.commit();

    // ✅ FIX 3: return response
    return { message: 'Payment successful' };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
createBooking,
makePayment
}
