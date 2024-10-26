import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required!"],

        minlength: [3, "Username must be at least 3 characters long."],
        maxlength: [20, "Username must not exceed 20 characters."],
    },
    password: {
        type: String,
        required: [true, "Password is required!"],

    },
    email: {
        type: String,
        required: [true, "Email is required!"],
    },
    manager: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    role: {
        type: String,
        enum: ["Admin", "Manager", "User"],
        default: "User"
    }
}, { timestamps: true });


//mongoose middleware for validating email
userSchema.pre('save', function (next) {
    const user = this;

    if (!validator.isEmail(user.email)) {
        return next(new Error("Invalid email!!"));
    }

    next();
});

export default mongoose.model("user", userSchema, "user");
