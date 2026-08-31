class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Unauthorized", details) {
    return new ApiError(401, message, details);
  }

  static forbidden(message = "Forbidden", details) {
    return new ApiError(403, message, details);
  }

  static notFound(message = "Not found", details) {
    return new ApiError(404, message, details); // details is a parameter
  }

  static conflict(message = "Conflict", details) {
    return new ApiError(409, message, details);
  }
}

module.exports = ApiError;