// const success = {
//   success: true,
//   message: "successfully completed the request",
//   data: {},
//   error: {},
// };

// module.exports = success;

// module.exports = error;
module.exports = function successResponse(data) {
  return {
    success: true,
    message: "successfully completed the request",
    data,
    error: {},
  };
};
