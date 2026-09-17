const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({
      field: i.path.join(".") || source,
      message: i.message,
    }));
    return res.status(400).json({ success: false, message: "Validation failed", errors });
  }
  req[source] = result.data;
  next();
};

module.exports = { asyncHandler, validate };
