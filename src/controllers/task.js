import { asyncHandler } from "../utils/asyncHandler.js";
import errorHandler from "../utils/errorHandler.js";
import user from "../models/user.js";
import taskModel from "../models/tasks.js";
import { sendSignupNotification, taskAssignmentNotification, taskCompletionNotification } from "../configs/nodemailer.js";


/**
 * @desc    Create a new task
 * @route   POST /api/v1/task
 * @access  Private (Admin, Manager)
 */
export const newTask = asyncHandler(async (req, res, next) => {
    const { title, description, dueDate } = req.body
    const newTaskDoc = new taskModel({ title, description, dueDate });
    await newTaskDoc.save();

    res.status(201).json({ status: true, message: "Task created successfully!" });
});




/**
 * @desc    Assign a task to a user
 * @route   PUT /api/v1/task/:id
 * @access  Private (Admin, Manager) 
 *          - Admin: Can assign tasks to any user.
 *          - Manager: Can assign tasks only to users within their own team.
 */
export const taskAssignment = asyncHandler(async (req, res, next) => {
    const { assignedUser } = req.body; // User ID to assign the task to
    const { taskId } = req.params; // Task ID to be assigned

    // Check if the provided user ID is valid and exists
    const isValidUserId = await user.findById(assignedUser);

    if (!isValidUserId) return next(new errorHandler("No user found with the given ID!", 400));



    // Check if the task exists
    const task = await taskModel.findById(taskId);

    if (!task) return next(new errorHandler("No task found with the given ID!", 400));

    if (task?.status === "Completed") {
        return next(new errorHandler("This task is already completed,you can not assigned this to anyone now", 400))
    }


    // Check manager role and restrict assignment to only users in their team
    if (req.role === "Manager" && req.userId !== isValidUserId.manager?.toString()) {
        return next(new errorHandler("Managers can only assign tasks to users within their own team.", 403));
    }

    await taskModel.findByIdAndUpdate(taskId, { assignedUser: assignedUser, assignedBy: req?.userId });

    // nodemailer fo sending notification to user
    taskAssignmentNotification({ email: isValidUserId?.email, username: isValidUserId?.username, title: task?.title })

    res.status(200).json({ status: true, message: "Task assigned successfully!" });
});



/**
 * @desc    Get details of all tasks
 * @route   GET /api/v1/task
 * @access  Private (Admin, Manager)
 */
export const getTaskDetails = asyncHandler(async (req, res, next) => {

    const tasks = await taskModel.find().populate("assignedUser", ["_id", "username", "email", "manager", "role"]);

    res.status(200).json({ status: true, data: tasks });
});


/**
 * @desc    Delete task
 * @route   DELETE /api/v1/task/:id
 * @access  Private (Admin, Manager)
 */
export const deleteTask = asyncHandler(async (req, res, next) => {

    const isValidTask = await taskModel.findByIdAndDelete(req?.params?.id)
    if (!isValidTask) {
        return next(new errorHandler("No task found with given id!!", 400))
    }

    res.status(200).json({ status: true, message: "Task deleted successfully!!" });
});



/**
 * @desc    Update task details. If the user completes the task, a notification email is sent to both the user and the assigner.
 * @route   PUT /api/v1/task/:id
 * @access  Private (Admin and Manager can modify any task detail, User can change task status only)
 */

export const updateTask = asyncHandler(async (req, res, next) => {
    const { status } = req.body;
    let updatedTaskDetails;

    // Allow "User" role to only change the task status
    if (req.role === "User") {
        if (!status) {

            return res.status(400).json({ success: false, message: "User can only change task status!" });
        }
        updatedTaskDetails = await taskModel.findByIdAndUpdate(req.params.id, { status }, { new: true });
    } else {
        // Admin and Manager roles can update any task field
        updatedTaskDetails = await taskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    }

    const taskDetails = await taskModel.findById(req.params.id)
        .populate("assignedBy", ["email"])
        .populate("assignedUser", ["username", "email"]);

    // Send completion notification if task status is "Completed"
    if (taskDetails.status === "Completed") {
        taskCompletionNotification(taskDetails);
    }

    res.status(200).json({ success: true, message: "Task updated successfully!" });
});



/**
 * @desc    get tasks for logged in or authenticated user
 * @route   get/api/v1/task/
 * @access  Private (Admin ,Manager,Authenticated user)
 * */
export const getMyTasks = asyncHandler(async (req, res, next) => {
    const tasks = await taskModel.find({ assignedUser: req?.userId })

    if (tasks.length <= 0) {

        return next(new errorHandler("No tasks is assigned to you!!"))
    }
    res.status(200).json({ status: true, data: tasks })
})
/**
 * @desc    give detail tasks analytics(for tracking overdue,completed,pendingtasks)
 * @route   get/api/v1/task/analytics
 * @access  Private (Admin,Manager)
 * */
export const getTasksAnalytics = asyncHandler(async (req, res, next) => {
    const completed_tasks = await taskModel.countDocuments({ status: "Completed" })
    const pending_tasks = await taskModel.countDocuments({ status: "Pending" })
    const overdue_tasks = await taskModel.countDocuments({ dueDate: { $gt: new Date() } })


    res.status(200).json({ status: true,overdue_tasks,pending_tasks,completed_tasks  })
})