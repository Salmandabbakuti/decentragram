import {
  ImageCreated as ImageCreatedEvent,
  ImageTipped as ImageTippedEvent
} from "../generated/Decentragram/Decentragram"
import { ImageCreated, ImageTipped } from "../generated/schema"

export function handleImageCreated(event: ImageCreatedEvent): void {
  let entity = new ImageCreated(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.id = event.params.id
  entity.description = event.params.description
  entity.hash = event.params.hash
  entity.tipAmount = event.params.tipAmount
  entity.author = event.params.author
  entity.save()
}

export function handleImageTipped(event: ImageTippedEvent): void {
  let entity = new ImageTipped(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  entity.id = event.params.id
  entity.hash = event.params.hash
  entity.description = event.params.description
  entity.tipAmount = event.params.tipAmount
  entity.author = event.params.author
  entity.save()
}
