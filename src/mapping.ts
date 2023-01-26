import {
  PostCreated as PostCreatedEvent,
  TipCreated as TipCreatedEvent
} from "../generated/Decentragram/Decentragram";
import { Post, Tip } from "../generated/schema";
import { sendPushNotification } from "./pushNotification";

export const subgraphID = "salmandabbakuti/decentragram";

export function handlePostCreated(event: PostCreatedEvent): void {
  let post = new Post(event.params.id.toString());
  post.content = event.params.content;
  post.imageHash = event.params.imageHash;
  post.earnings = event.params.earnings;
  post.author = event.params.author;
  post.createdAt = event.block.timestamp;
  post.save();

  // Prepare push notification
  // TODO: change to recipient address to channel address if type is 1
  let recipient = "0x7348943C8d263ea253c0541656c36b88becD77B9",
    type = "1",
    title = "New Post",
    body = event.params.content,
    subject = "New Post",
    message = `A new post from ${event.params.author.toHexString()}`,
    image = `https://ipfs.io/ipfs/${event.params.imageHash}`,
    secret = "null",
    cta = "https://play.google.com/store/apps/details?id=com.decentragram";

  let notification = `{\"type\": \"${type}\", \"title\": \"${title}\", \"body\": \"${body}\", \"subject\": \"${subject}\", \"message\": \"${message}\", \"image\": \"${image}\", \"secret\": \"${secret}\", \"cta\": \"${cta}\"}`;

  // Send push notification. it gets stored first and then polled by the push notification service
  sendPushNotification(recipient, notification);
}

export function handleTipCreated(event: TipCreatedEvent): void {
  let tip = new Tip(event.params.id.toString());
  let post = Post.load(event.params.postId.toString());
  if (post) {
    post.earnings = post.earnings.plus(event.params.amount);
    post.save();
  }
  tip.post = event.params.postId.toString();
  tip.amount = event.params.amount;
  tip.sender = event.params.sender;
  tip.createdAt = event.block.timestamp;
  tip.save();
}
