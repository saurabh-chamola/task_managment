import mongoose from "mongoose";
import chalk from "chalk";
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI 
    console.log(uri)
    await mongoose.connect(uri).catch((error) => console.log(error));

    console.log(chalk.bgMagentaBright("MONGODB CONNECTED SUCCESSFULLY!"));
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default connectDB;
