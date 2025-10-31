import { UserProps } from "../types/types";
import { Schema, model } from "mongoose";

const UserSchema = new Schema<UserProps>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const User = model<UserProps>("User", UserSchema);

export default User;
