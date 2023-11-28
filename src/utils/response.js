// Utility for success response
function successResponse(res, data, statusCode, message) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

// Utility for error response
function errorResponse(res, errorMessage, statusCode) {
  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
}

export { successResponse, errorResponse };
