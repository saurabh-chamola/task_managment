import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        minlength: [5, "Title must be at least 5 characters long"],
        maxlength: [100, "Title must not exceed 100 characters"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        minlength: [10, "Description must be at least 10 characters long"],
        maxlength: [500, "Description must not exceed 500 characters"]
    },
    dueDate: {
        type: Date,
        required: [true, "Due date is required"]
    },
    assignedUser: {
        type: mongoose.Types.ObjectId,
        ref: "user",
       
    },
    assignedBy: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    status: {
        type: String,
        enum: ["Pending", "Completed"],
        default: "Pending"
    }
}, { timestamps: true });

export default mongoose.model("task", taskSchema, "task");
