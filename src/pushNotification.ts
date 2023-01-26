import {
  BigInt,
  log
} from "@graphprotocol/graph-ts";
import { PushNotificationCounter, PushNotification } from '../generated/schema';
import { subgraphID } from "./mapping";

export function sendPushNotification(recipient: string, notification: string): void {
  let id1 = subgraphID;
  log.info('New id of PushNotificationCounter is: {}', [id1]);
  let pushNotificationCounter = PushNotificationCounter.load(id1);
  if (pushNotificationCounter == null) {
    pushNotificationCounter = new PushNotificationCounter(id1);
    pushNotificationCounter.totalCount = BigInt.fromI32(0);
  }
  pushNotificationCounter.totalCount = (pushNotificationCounter.totalCount).plus(BigInt.fromI32(1));

  let count = pushNotificationCounter.totalCount;
  let id2 = `${subgraphID}_${count}`;
  log.info('New id of PushNotification is: {}', [id2]);
  let pushNotification = PushNotification.load(id2);
  if (pushNotification == null) {
    pushNotification = new PushNotification(id2);
  }
  pushNotification.recipient = recipient;
  pushNotification.notification = notification;
  pushNotification.notificationNumber = pushNotificationCounter.totalCount;
  pushNotification.save();
  pushNotificationCounter.save();
}