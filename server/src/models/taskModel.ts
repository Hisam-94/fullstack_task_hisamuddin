import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  tasks: string[];
}

const TaskSchema: Schema = new Schema({
  tasks: { type: [String], required: true },
});

export const Task = mongoose.model<ITask>("assignment_hisamuddin", TaskSchema);
