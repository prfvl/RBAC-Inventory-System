import { body, validationResult } from 'express-validator';

export const validateCreateItem = [
  body('name').trim().notEmpty().withMessage('Name required').isLength({ max: 100 }),
  body('sku').trim().notEmpty().toUpperCase(),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be non-negative number'),
  body('minThreshold').optional().isInt({ min: 0 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
