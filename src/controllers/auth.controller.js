const authService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');
const Joi = require('joi');

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName
      });

      return ApiResponse.created(
        res,
        result,
        'User registered successfully'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      return ApiResponse.success(
        res,
        result,
        'Login successful'
      );

    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (client-side token removal)
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      // Since we're using stateless JWT, logout is handled client-side
      // This endpoint exists for consistency and future enhancements
      
      return ApiResponse.success(
        res,
        null,
        'Logout successful'
      );

    } catch (error) {
      next(error);
    }
  }
}

// Validation schemas
AuthController.registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required()
  })
};

AuthController.loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  })
};

module.exports = new AuthController();
