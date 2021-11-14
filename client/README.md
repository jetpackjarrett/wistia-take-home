# Jarrett's Wistia Take Home Assignment

Tested in Google Chrome 95.0.4638.69 on MacOS Monterrey.

## Playlist

### Architecture and Technology Overview

I began by reading the Wistia API documentation to get a better grip on how to
approach the requirements. After that, I played around a bit and determined that
leveraging the existing plugin API provided would be the cleanest approach.

I created the `autoplay-with-countdown` plugin. It requires two key arguments:

- `medias` the list of wistia medias we already fetched.
- `from` the number of seconds to countdown from.

The plugin handles a few key pieces of the requirements:

1. When the plugin loads, the video is marked as "currently playing", by adding
   a `.currently-playing` CSS class. Any of the items that were previously set to
   currently-playing have that class replaced with `.played` and it is moved to
   the bottom of the visible playlist.
1. The video's hashedId is stored in a global Set to track that it has been played.
1. The next video from the `medias` array not already included in the global set
   is chosen as the "next" video to play. This allows the array to be a reliable
   source of truth to which video should play next rather than using any of the
   existing automatic playlist choices.
1. If a "next" video is found, we add it to the playlist, then define a crosstime
   event handler to the current video. Using crosstime allows us to trigger the
   countdown overlay as the video ends but before the "end" event (which seems to
   be too late in the video event lifecycle for this to be effective).
1. Once the crosstime event fires, we pause the video and inject a countdown
   overlay into the video grid. A 1 second interval fires off until the countdown
   reaches zero, at which time we remove the countdown and resume the video.

### Changes to initial project

I made a few small structural changes to the initial application, some for
performance and some for ease of development. I'm working under the assumption
that the ideal browser support for this project is all major "supported" browsers
(Edge, Firefox, Chrome, Safari).

- I converted `Playlist` to be a class. This is admittedly a bit of overkill but
  having an instance of the fetched media made it easier to work with. Plus it
  would make having multiple playlists existing on the same page a simple addition.

- I removed axios in favor of native browser `fetch`. This removes a mostly
  unnecessary dependency.

- `common.js` and `playlist.js` are now loaded as ES modules since the above
  defined browsers support this functionality. This is mostly cosmetic but if
  this were to grow in complexity, ESM would allow for better code reuse since
  the calling code is aware of its import rather than relying on script injection
  order in the HTML file.

### Next Steps / TODOs

Given a longer timeline or scale, there are a few things I'd focus on:

1. The plugin approach as written is somewhat brittle as it relies on the
   assumption that markup and styles exist on the page with a given HTML structure.
   I would like to use the configuration object to handle this more resiliently.
   Class names, ids, etc. could be configurable.
1. Ideally the countdown template would be colocated to the plugin. Using an HTML
   template was merely a time saving measure.
1. Each time a video loads, the current approach to find the next item uses `find`
   which could become slow given a playlist that is both very long and the played
   Set is also long. A more performant approach could be to remove a played video
   from an array and find the "next" one by popping off the first item. I find the
   approach I implemented easier to reason about so I stuck with it.

## Search by tag

This presumes Postgres syntax.

_Disclaimer: I haven't written SQL in a couple years so please excuse any clunkiness._

### Tags Schema

Structurally, I'd use a many-to-many relation table to link tags to videos.

```
CREATE TABLE videos (
  id  SERIAL PRIMARY KEY,
  name CHAR(50),
  description TEXT,
  play_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tags (
  id  SERIAL PRIMARY KEY,
  name CHAR(50)
);

CREATE TABLE videos_tags (
  id  SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos (id),
  tag_id INTEGER REFERENCES tags (id)
);
```

### Query for videos with at least 1 play count

```
SELECT COUNT(id) FROM videos WHERE play_count > 0
```

### Querying videos with tags

```
SELECT v.*,COUNT(t.id) as tag_count
FROM videos_tags vt, videos v, tags t
WHERE vt.tag_id = t.id
AND v.id = vt.video_id
GROUP BY v.id
ORDER BY tag_count DESC, created_at DESC
LIMIT 1;
```
