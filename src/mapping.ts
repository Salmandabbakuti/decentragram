import {
  PostCreated as PostCreatedEvent,
  TipCreated as TipCreatedEvent
} from "../generated/Decentragram/Decentragram";
import { Post, Tip } from "../generated/schema";

export function handlePostCreated(event: PostCreatedEvent): void {
  let post = new Post(event.params.id.toString());
  post.content = event.params.content;
  post.imageHash = event.params.imageHash;
  post.earnings = event.params.earnings;
  post.author = event.params.author;
  post.createdAt = event.block.timestamp;
  post.save();
}

export function handleTipCreated(event: TipCreatedEvent): void {
  let tip = new Tip(event.params.id.toString());
  tip.postId = event.params.postId;
  tip.amount = event.params.amount;
  tip.sender = event.params.sender;
  tip.createdAt = event.block.timestamp;
  tip.save();
}
