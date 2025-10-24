const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: err.statusCode || 500,
    message: err.message || 'Internal Server Error'
  };

  // Validation errors
  if (err.isJoi) {
    error = {
      status: 400,
      message: 'Validation Error',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      status: 401,
      message: 'Invalid token'
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      status: 401,
      message: 'Token expired'
    };
  }

  // Duplicate key error
  if (err.code === 11000) {
    error = {
      status: 400,
      message: 'Duplicate field value'
    };
  }

  // Cast error
  if (err.name === 'CastError') {
    error = {
      status: 400,
      message: 'Invalid ID format'
    };
  }

  res.status(error.status).json({
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
