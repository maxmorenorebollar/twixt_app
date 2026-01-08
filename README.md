## Deployed @ [twixt-app](https://twixt-app.onrender.com/creategame)
Make take a couple seconds to turn on from idle.

## Rules
Red - player or team using red pegs and links to connect the two red borders.

Blue - player or team using blue pegs and links to connect the two blue borders.

Barrier - a link placed between two pegs; a barrier cannot be crossed. A row of unlinked pegs is not a barrier.

Twix - the basic linking move, i.e., a peg placed linking distance away from a previously placed peg (distance corresponding to the diagonal of a 6-holed rectangle, similar to the knight's move in chess) in order to link the two pegs.

Double - Link-to place a peg the linking distance away from two previously placed pegs, permitting the player to link all three pegs in the same move.

Setup - a planned pattern of pegging which permits the player to double-link in either of two directions.

## Some things I learned
- Type Safety: Used TypeScript interfaces and Zod schemas for robust type validation
- Real-Time Architecture: Built turn-based game server with Socket.io and state management
- Implemented functional error patterns using neverthrow's Result type
- Full-Stack Setup: Configured Express with CORS, static serving, and SPA routing
