// const error = {
//   success: false,
//   message: "some error occurred",
//   data: {},
//   error: {},
// };
module.exports = function ErrorResponse(error) {
  return {
    success: false,
    message: "some error occurred",
    data: {},
    error: error,
  };
};
