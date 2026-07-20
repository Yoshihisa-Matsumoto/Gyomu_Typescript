import { Direction, Status } from './01-basic-enum.js'

export interface Config {
  direction: Direction
  status: Status
}

export const current = Direction.Up

export function move(direction: Direction): Status {
  switch (direction) {
    case Direction.Up:
      return Status.Running

    default:
      return Status.Pending
  }
}
