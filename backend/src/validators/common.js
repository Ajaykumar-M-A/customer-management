export function validate(schema, property = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const error = new Error('Validation failed');
      error.status = 400;
      error.details = result.error.flatten();
      return next(error);
    }
    req[property] = result.data;
    return next();
  };
}
