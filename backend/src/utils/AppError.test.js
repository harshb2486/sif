// Example test for utility functions

const { ValidationError, AppError } = require('../../utils/AppError');

describe('AppError', () => {
  test('should create an AppError with message and statusCode', () => {
    const error = new AppError('Test error', 400);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  test('should serialize AppError to JSON', () => {
    const error = new AppError('Test error', 400, { field: 'email' });
    const json = error.toJSON();
    
    expect(json.success).toBe(false);
    expect(json.message).toBe('Test error');
    expect(json.statusCode).toBe(400);
    expect(json.details).toEqual({ field: 'email' });
  });
});

describe('ValidationError', () => {
  test('should create a ValidationError with 400 status', () => {
    const error = new ValidationError('Invalid input', [{ field: 'email', message: 'Invalid email' }]);
    
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('ValidationError');
  });
});

describe('AuthenticationError', () => {
  test('should create an AuthenticationError with 401 status', () => {
    const error = new ValidationError();
    
    expect(error.statusCode).toBe(401);
  });
});
