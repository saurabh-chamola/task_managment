import { sendSignupNotification } from "../configs/nodemailer.js";
import userModel from "../models/user.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import errorHandler from "../utils/errorHandler.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * @desc    Register a new user with username, email, and password
 * @route   POST /api/v1/user/signup
 * @access  Public
 */
export const signup = asyncHandler(async (req, res, next) => {
    const { password, email, username, role, manager } = req.body;
    if (manager && role === "Manager") {
        return next(new errorHandler("You selected the role of Manager hence you cannot choose your manager", 400))
    }
    //checks for existing email and username

    const isEmailAlreadyExists = await userModel.findOne({ email })
    const isUsernameAlreadyExists = await userModel.findOne({ username })

    if (isEmailAlreadyExists) return next(new errorHandler("Email already exists!! choose another one!!"))
    if (isUsernameAlreadyExists) return next(new errorHandler("username already exists!! choose another one!!"))

    // Validate password criteria: Minimum 8 characters, at least one letter and one number
    const regxPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,15}$/;
    if (!regxPassword.test(password)) {
        return next(new errorHandler("Password must contain at least one letter, one number, and be between 8 and 15 characters long."));
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserDoc = new userModel({ ...req.body, password: hashedPassword });
    await newUserDoc.save()

    //Nodemailer for notification
    sendSignupNotification({ email, username })

    res.status(201).json({ status: true, message: "Signup successful!" });
});

/**
 * @desc    Log in a user and generate a JWT token
 * @route   POST /api/v1/user/login
 * @access  Public
 */


export const login = asyncHandler(async (req, res, next) => {
    const { password, email, username } = req.body;

    // Check if either username or email is provided
    if (!username && !email) {
        return next(new errorHandler("Please provide either a username or an email."));
    }

    // Check if user already exists
    const isUserExists = await userModel.findOne({ $or: [{ username }, { email }] });
    if (!isUserExists) {
        return next(new errorHandler("No user found! Please sign up first."));
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, isUserExists.password);
    if (!isPasswordValid) {
        return next(new errorHandler("Invalid password!"));
    }

    // Generate JWT 
    const token = jwt.sign(
        { id: isUserExists._id, role: isUserExists.role },
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "15m" } // Set token expiration time
    );

    // Cookie options
    const options = {
        expires: new Date(Date.now() + 3600000), // 1 hour
        sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "Lax",
        secure: process.env.NODE_ENV === "PRODUCTION", // Set to true in production for HTTPS
        httpOnly: true, // Prevents JavaScript from accessing the cookie
    };

    // Send response with cookie
    res.status(200).cookie("ACCESS_TOKEN", token, options).json({
        status: true,
        message: "User logged in successfully"
    });
});


/**
 * @desc    Log out a user by clearing the JWT token from cookies
 * @route   POST /api/v1/user/logout
 * @access  Public
 */
export const logout = asyncHandler(async (req, res, next) => {
    res.clearCookie("ACCESS_TOKEN");
    res.status(200).json({ status: true, message: "Logged out successfully!" });
});

/**
 * @desc    Get details of the authenticated user
 * @route   GET /api/v1/user/authenticatedUser
 * @access  private
 */
export const getAuthenticatedUserDetails = asyncHandler(async (req, res, next) => {
    const existingUser = await userModel.findById(req.userId).populate("manager", ["_id", "username", "email"]);
    if (!existingUser) return next(new errorHandler("No user details found! Please try again."));


    res.status(200).json({ status: true, data: existingUser });
});

/**
 * @desc    Retrieve details of all users
 * @route   GET /api/v1/user/userDetails
 * @access  Private (Admin, Manager)
 */
export const getAllUserDetails = asyncHandler(async (req, res, next) => {
    let userDetails;
    if (req?.role === "Manager") {
        userDetails = await userModel.find({ manager: req?.userId }).populate("manager", ["_id", "username", "email"]);
    } else {
        userDetails = await userModel.find().populate("manager", ["_id", "username", "email"]);
    }
    res.status(200).json({ status: true, data: userDetails });
});
