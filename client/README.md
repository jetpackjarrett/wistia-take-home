# Jarrett's Wistia Take Home Assignment

Tested in Google Chrome 95.0.4638.69 on MacOS Monterrey.

## Playlist

### Architecture and Technology Overview

I began by reading the Wistia API documentation to get a better grip on how to
approach the requirements. After that, I played around a bit and determined that
leveraging the existing plugin API provided would be the cleanest way to add
the countdown requirement. `autoplay-countdown.js` handles the 5 second countdown timer by reaching into the playlist for the next video and displaying the thumbnail and timer over the grid api.
It also has a countdown tier that needs to be cleaned up along side the event unbinding so I made sure to return both in the cleanup callback.
