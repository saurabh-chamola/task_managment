import express from "express";
import rateLimit from 'express-rate-limit';

import {
    getAllUserDetails,
    getAuthenticatedUserDetails,
    login,
    logout,
    signup
} from "../controllers/user.js";
import { verifyTokenMiddleware } from "../middlewares/verifyToken.js";
import { checkRole } from "../middlewares/checkRole.js";

// Function for avoiding brute-force attacks for login
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes 
    max: 5, // 5 login attempts
    message: {
        error: "Too many login attempts. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: User Operations APIs
 *     description: APIs related to user actions such as signing up, logging in, and getting user details.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the user.
 *         username:
 *           type: string
 *           description: User's unique username.
 *         password:
 *           type: string
 *           description: Hashed password for user authentication.
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address.
 *         manager:
 *           type: string
 *           description: ObjectId reference to the user's manager.
 *         role:
 *           type: string
 *           enum: [Admin, Manager, User]
 *           description: Role of the user in the system.
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for when the user was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for the last update to the user.
 */




/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     tags: [User Operations APIs]
 *     summary: Register a new user
 *     description: This section is for creating a new user under the roles of Admin, Manager, or User. If the role is 'User,' a manager can be assigned by adding the manager field with the corresponding ObjectId. Additionally, a manager can only manage their own team members
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The desired username (3-20 characters).
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email (must be unique).
 *               password:
 *                 type: string
 *                 description: The user's password (8-15 characters, containing letters and numbers).
 *               role:
 *                 type: string
 *                 enum: [Admin, Manager, User]
 *                 description: Role of the user in the system (Admin, Manager, or User).
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or registration error.
 */

router.route("/signup").post(signup);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags: [User Operations APIs]
 *     summary: Log in a user
 *     description: Authenticates the user using their username or email and password. express-rate-limitter is also integrated with this api for avoiding brute force attack. 5 login attempts allowed within 5 minutes per ip
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email used for login.
 *               password:
 *                 type: string
 *                 description: User password.
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns token in cookies.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message upon login.
 *                 token:
 *                   type: string
 *                   description: Authentication token.
 *       401:
 *         description: Invalid username, email, or password.
 */
router.route("/login").post(loginLimiter, login);

/**
 * @swagger
 * /api/v1/user/logout:
 *   post:
 *     tags: [User Operations APIs]
 *     summary: Log out a user
 *     description: Logs out the user by clearing their authentication token.
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message upon logout.
 */
router.route("/logout").post(logout);

/**
 * @swagger
 * /api/v1/user/authenticatedUser:
 *   get:
 *     tags: [User Operations APIs]
 *     summary: Get authenticated user details
 *     description: Fetches the details of the logged-in user.it will return the data from redis database from second attempt for making response more efficient
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: User not authenticated.
 */
router.route("/authenticatedUser").get(verifyTokenMiddleware, getAuthenticatedUserDetails);

/**
 * @swagger
 * /api/v1/user/userDetails:
 *   get:
 *     tags: [User Operations APIs]
 *     summary: Get all users' details
 *     description: Provides a list of all users, accessible only by Admin and Manager roles.it will return the data from redis database from second attempt for making response more efficient
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied for non-authorized users.
 */
router.route("/userDetails").get(verifyTokenMiddleware, checkRole("Admin", "Manager"), getAllUserDetails);

export default router;
