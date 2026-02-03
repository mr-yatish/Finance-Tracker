"use server";

import { connectToDatabase } from "@/lib/database/mongoose";
import SystemLog from "@/lib/database/models/system-log.model";

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

interface LogEntry {
    action: string;
    message: string;
    level?: LogLevel;
    details?: any;
    userId?: string;
}

export async function logEvent({ level = LogLevel.INFO, action, message, details, userId }: LogEntry) {
    try {
        // Always log to console for standard output capturing (Vercel/PM2)
        const timestamp = new Date().toISOString();
        const consoleMsg = `[${timestamp}] [${level}] [${action}] ${message}`;

        if (level === LogLevel.ERROR) {
            console.error(consoleMsg, details ? JSON.stringify(details, null, 2) : '');
        } else {
            console.log(consoleMsg, details ? JSON.stringify(details, null, 2) : '');
        }

        // Persist to MongoDB for production inspection
        await connectToDatabase();
        await SystemLog.create({
            level,
            action,
            message,
            details,
            userId,
            timestamp: new Date()
        });

    } catch (error) {
        // Fallback if DB logging fails
        console.error("CRITICAL: Failed to write to system log", error);
    }
}
