import { Schema, model } from "mongoose";
import { ConversationProps } from "../types/types";

const ConversationSchema = new Schema<ConversationProps>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
    },
    name: {
      type: String,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    avatar: {
      type: String,
      default: "",
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    // createdAt: {
    //   type: Date,
    //   default: Date.now,
    // },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.pre("save", function(next) {
    this.updatedAt = new Date();
    next();
});

const Conversation = model<ConversationProps>("Conversation", ConversationSchema);

export default Conversation;
