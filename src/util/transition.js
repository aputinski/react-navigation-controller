export const type = {
  NONE: 0,
  PUSH_LEFT: 1,
  PUSH_RIGHT: 2,
  PUSH_UP: 3,
  PUSH_DOWN: 4,
  COVER_LEFT: 5,
  COVER_RIGHT: 6,
  COVER_UP: 7,
  COVER_DOWN: 8,
  REVEAL_LEFT: 9,
  REVEAL_RIGHT: 10,
  REVEAL_UP: 11,
  REVEAL_DOWN: 12
}

export function isPush (t) {
  return t === type.PUSH_LEFT ||
         t === type.PUSH_RIGHT ||
         t === type.PUSH_UP ||
         t === type.PUSH_DOWN
}

export function isCover (t) {
  return t === type.COVER_LEFT ||
         t === type.COVER_RIGHT ||
         t === type.COVER_UP ||
         t === type.COVER_DOWN
}

export function isReveal (t) {
  return t === type.REVEAL_LEFT ||
         t === type.REVEAL_RIGHT ||
         t === type.REVEAL_UP ||
         t === type.REVEAL_DOWN
}
