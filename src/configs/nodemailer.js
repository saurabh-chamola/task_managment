import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

// Set up the current directory and environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Configure Nodemailer transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.FROM_MAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

/**
 * Sends a signup notification email to a new user.
 * 
 * This function is called whenever a new user signs up, and it sends 
 * a welcome email .
 * 
 */
export const sendSignupNotification = async (mailerData) => {
    try {
        console.log(mailerData,"mailerrrr")
        const ejsTemplatePath = path.join(__dirname, '../views/signup.ejs');

        // Render the EJS template with the user's data
        const data = await ejs.renderFile(ejsTemplatePath, {
            email: mailerData?.email,
            name: mailerData?.username
        });

        // Send the email
        const info = await transporter.sendMail({
            from: process.env.FROM_MAIL,
            to: mailerData?.email,
            subject: "Signup Successfully",
            text: "Congratulations on your signup!",
            html: data,
        });

        console.log("Signup notification sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending signup notification:", error);
    }
};

/**
 * Sends a task assignment notification email to the user.
 * 
 * This function is used to notify a user when a new task is assigned 
 * to them, including the task title and their name.
 */
export const taskAssignmentNotification = async (mailerData) => {
    try {
        const ejsTemplatePath = path.join(__dirname, '../views/taskAssignment.ejs');

        // Render the EJS template with the user's data and task title
        const data = await ejs.renderFile(ejsTemplatePath, {
            email: mailerData?.email,
            name: mailerData?.username,
            title: mailerData?.title
        });

        // Send the email
        const info = await transporter.sendMail({
            from: process.env.FROM_MAIL,
            to: mailerData?.email,
            subject: "New Task Assigned",
            html: data,
        });

        console.log("Task assignment notification sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending task assignment notification:", error);
    }
};
/**
 * Sends a task completion notification email .
 * 
 * This function is used to notify  user and to one who assigned the task to user when task is completed
 * to them, including the task title and their name.
 */
export const taskCompletionNotification = async (mailerData) => {
    try {

        const ejsTemplatePath = path.join(__dirname, '../views/taskCompleted.ejs');

        // Render the EJS template with the user's data and task title
        const data = await ejs.renderFile(ejsTemplatePath, {
            email: mailerData?.assignedUser?.email,
            userName: mailerData?.assignedUser?.username,
            title: mailerData?.title,
            id: mailerData?._id
        });

        // Send the email
        const info = await transporter.sendMail({
            from: process.env.FROM_MAIL,
            to: [mailerData?.assignedUser?.email, mailerData?.assignedBy?.email],
            subject: "Task Completion Notification",
            html: data,
        });

        console.log("Task assignment notification sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending task assignment notification:", error);
    }
};
