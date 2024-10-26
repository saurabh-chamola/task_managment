import express from "express";
import cors from "cors";
import {
    deleteTask,
    getMyTasks,
    getTaskDetails,
    getTasksAnalytics,
    newTask,
    taskAssignment,
    updateTask
} from "../controllers/task.js";
import { verifyTokenMiddleware } from "../middlewares/verifyToken.js";
import { checkRole } from "../middlewares/checkRole.js";


const router = express.Router()

/**
 * @swagger
 * servers:
 *   - url: https://task-managment-fa53.onrender.com
 *     description: Render production server
 */

/**
 * @swagger
 * tags:
 *   - name: Task Management APIs
 *     description: APIs for task creation, assignment, retrieval, update, and deletion.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Primary key.
 *         title:
 *           type: string
 *           description: Task title with a minimum of 5 characters.
 *           example: "Task title"
 *         description:
 *           type: string
 *           description: Detailed description of the task with a minimum of 10 characters.
 *           example: "Task description"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Task due date.
 *           example: "2024-12-12"
 *         assignedUser:
 *           type: string
 *           format: ObjectId
 *           description: User ID of the task assignee.
 *           example: "60b6c5f5d42e8a23b0b1b2a3"
 *         assignedBy:
 *           type: string
 *           format: ObjectId
 *           description: User ID of the assigner.
 *           example: "60b6c5f5d42e8a23b0b1b2a2"
 *         status:
 *           type: string
 *           enum: ["Pending", "Completed"]
 *           description: Current status of the task.
 *           example: "Pending"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for when the task was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp for the last update to the task.
 */

/**
 * @swagger
 * /api/v1/task:
 *   get:
 *     tags: [Task Management APIs]
 *     summary: Retrieve All Tasks
 *     description: Admins and Managers can fetch all task details, with filtering by status ("Pending" or "Completed") and searching by `title`.
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter tasks by status ("Pending" or "Completed").
 *       - in: query
 *         name: title
 *         schema:
           type: string
 *         required: false
 *         description: Search tasks by title (case-insensitive).
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.route("/").get(verifyTokenMiddleware, checkRole("Admin", "Manager"), getTaskDetails);

/**
 * @swagger
 * /api/v1/task/taskAssignment/{taskId}:
 *   put:
 *     tags: [Task Management APIs]
 *     summary: Assign Task
 *     description: Assign a task to a user. Admins can assign tasks to anyone, while Managers can only assign tasks to users on their team. If a task is already completed, it cannot be reassigned.
 *     parameters:
 *       - name: taskId
 *         in: path
 *         required: true
 *         description: The ID of the task to assign.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignedUser:
 *                 type: string
 *                 format: ObjectId
 *                 description: The ID of the user to whom the task is assigned.
 *                 example: "60b6c5f5d42e8a23b0b1b2a3"
 *     responses:
 *       200:
 *         description: Task assigned successfully.
 *       400:
 *         description: Task is already completed, cannot assign.
 *       404:
 *         description: Task not found.
 */
router.route("/taskAssignment/:taskId").put(verifyTokenMiddleware, checkRole("Admin", "Manager"), taskAssignment);

/**
 * @swagger
 * /api/v1/task/getMyTasks:
 *   get:
 *     tags: [Task Management APIs]
 *     summary: Get My Tasks
 *     description: Retrieve all tasks assigned to the logged-in user, with filtering by `status` ("Pending" or "Completed") and searching by "title".
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Filter tasks by status ("Pending" or "Completed").
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: Search tasks by title (case-insensitive).
 *     responses:
 *       200:
 *         description: User's tasks retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.route("/getMyTasks").get(verifyTokenMiddleware, getMyTasks);

/**
 * @swagger
 * /api/v1/task/{id}:
 *   put:
 *     tags: [Task Management APIs]
 *     summary: Update Task
 *     description: Users can only update the status of a task (e.g., from Pending to Completed). Admins and Managers can modify any field.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *       404:
 *         description: Task not found.
 */
router.route("/:id").put(verifyTokenMiddleware, updateTask);

/**
 * @swagger
 * /api/v1/task/{id}:
 *   delete:
 *     tags: [Task Management APIs]
 *     summary: Delete Task
 *     description: Remove a task by its ID. Only Admins and Managers are authorized to delete tasks.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the task to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *       404:
 *         description: Task not found.
 */
router.route("/:id").delete(verifyTokenMiddleware, checkRole("Admin", "Manager"), deleteTask);

/**
 * @swagger
 * /api/v1/task/analytics:
 *   get:
 *     tags: [Task Management APIs]
 *     summary: Get Task Analytics
 *     description: Retrieve task analytics including counts of completed, pending, and overdue tasks.
 *     responses:
 *       200:
 *         description: Task analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: integer
 *                   description: Total number of tasks.
 *                   example: 100
 *                 completedTasks:
 *                   type: integer
 *                   description: Number of tasks that are completed.
 *                   example: 70
 *                 pendingTasks:
 *                   type: integer
 *                   description: Number of tasks that are still pending.
 *                   example: 20
 *                 overdueTasks:
 *                   type: integer
 *                   description: Number of tasks that are overdue.
 *                   example: 10
 */
router.route("/analytics").get(verifyTokenMiddleware, checkRole("Admin", "Manager"), getTasksAnalytics);

export default router;
