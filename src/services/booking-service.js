const axios = require('axios');

const {ServerConfig} = require('../config')
const {BookingRepository} = require('../repositories');
const db = require('../models');
const { StatusCodes } = require('http-status-codes');
const bookingRepository = new BookingRepository()
const AppError = require('../utils/errors/app-error');

async function createBooking(data) {
     const transaction = await db.sequelize.transaction();
        try {
    const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
    const flightData = flight.data.data;
     if(data.noofSeats > flightData.totalSeats) {
        // throw {message: 'No of seats exceeds available seat'}
        throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST)
     }
     await transaction.commit();
    return true;
    } catch(error) {
 await transaction.rollback();
 throw error;
    }
}
       
    
module.exports = {
createBooking
}
