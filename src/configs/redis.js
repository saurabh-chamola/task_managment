import Redis from "ioredis";
import dotenv from "dotenv"

dotenv.config()

export const redis = new Redis({
    port: 19678, // Redis port
    host: "redis-19678.c264.ap-south-1-1.ec2.redns.redis-cloud.com", // Redis host 
    password:process.env.REDIS_PASSWORD,
   
})