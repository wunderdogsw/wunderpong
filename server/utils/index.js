// Uncomment to enable face recognition
// export * from './face-recognitor'

export * from './image-utils'

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)