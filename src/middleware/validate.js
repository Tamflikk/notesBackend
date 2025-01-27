import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation Error');
    error.type = 'validation';
    error.errors = errors.array();
    return next(error);
  }
  next();
};