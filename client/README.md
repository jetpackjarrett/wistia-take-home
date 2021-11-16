# Jarrett's Wistia Take Home Assignment

Tested in Google Chrome 95.0.4638.69 on MacOS Monterrey.

## Usage

1. cd to the project root
1. Run `npm install` if you haven't already
1. Run `npm start`
1. Follow the links in the command line to playlist.html or dashboard.html.

## Playlist

### Tech/Architecture

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

### Changes To Initial Project

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

## Owner Dashboard

For this, I decided to create a server that handled a few things:

1. Proxying the fetch request for medias and hydrating it with visibility status
   queried from a local datastore.
1. Idempotent endpoints for toggling the visibility state in the local datastore.
1. Serving the playlist and dashboard files. This is handy because it means I
   only have to run one process to serve the entire project and I can skip CORS
   handling since the API server and client are on the same endpoint.

### Tech/Architecture

#### Endpoints

##### `GET /medias?api_password=<API_TOKEN>`

Does the Wistia API fetch, queries the datastore for any medias in the API results
and injects a `hidden` boolean value for any medias found to be hidden in our datastore.

##### `PUT /medias/:hashed_id/hide`

Enables the hidden state of a media. Requires a PUT to prevent accidental toggling
(from opening the URL for example) and to be somewhat RESTful. Normally put endpoints
are for updating a record so I realize this is a little weird. To me, the user
thinks they're updating a record (visibility state on a media) so thats the
interface I wanted to provide.

##### `PUT /medias/:hashed_id/unhide`

Disables the hidden state of a media. Requires a PUT to prevent accidental toggling
(from opening the URL for example) and to be somewhat RESTful. I decided to keep
the endpoints separate rather than have some sort of "toggle" endpoint for two reasons.
Firstly, the business logic was different enough that it felt cleanear to keep them
separate. Secondly, this ensures idempotency. I'd like to avoid weird off-by-one
state errors if possible.

#### Data Schema

At first, I considered a key/value setup that resembled data that looked like this:

```
[
   {
      id: 1,
      media_id: 'abc123',
      visible: false,
   }
]
```

Toggled records would be inserted if a media_id wasn't found, otherwise the visible
value would be toggled.

Then it occurred to me, that a record not existing was equivalent to visible being
true so I decided to just remove records that needed no visibiilty state. To
simplify this further, I decided to just utilize the media_id itself as the record's
primary key to simplify things further.

The schema is now basically just:

```
media_id char(10) PRIMARY_KEY
```

In a 'real' production system, this would likely
need to have more constraints as a media_id might also need user and context.

I decided on SQLite for this, which I'll discuss more in the tech stack section below.

#### Tech Stack

- **Koa** - I chose koa as a node server because its lightweight and I've used it
  recently so I'm more refreshed on its syntax/ecosystem than I am with express or
  other options.
  - **koa-router** - Since we have 3 routes distinct, it made sense to separate
    them with a routing structure. koa-router also made responding to request methods
    simple, so the endpoints are somewhat more RESTful. Although these endpoints are
    not truly RESTful, it made the most pragmatic sense to me to set it up this way
    since true "REST" endpoints would be a little less intuitive in this context.
  - **koa-static** - This just makes serving the `client` directory automatic.
    All request not fulfilled by koa's other middlewares will attempt to map to
    a file path in the provided directory.
  - **node-fetch** - Promise-based requests that mirror browser's fetch API. I'm
    using it to make the request to the main Wistia API from my GET endpoint.
- **sqlite3** - I chose sqlite because it's easily portable. In a production environment,
  a key/value store would likely make sense here. Or, if there are more user/playlist
  constraints, I think a noSQL/document solution like mongo would work well because you
  could just query for a given playlist or user and the hidden videos would be
  stored as a set of attributes to the document.
  - **sqlite** - A promise/async interface for sqlite3. In my opinion, life is too
    short for callbacks.

### Next Steps / TODOs

Given a longer timeline or scale, there are a few things I'd focus on:

- Better sanitization. I'm currently just taking any parameter string from the
  toggling endpoints and using those as records. Despite its name, the function
  `doSomeVeryRealInputSanitization` is just illustrative and not actually sanitizing
  the input. Real sanitization would prevent SQL injection attacks and using some
  kind of validation method on the hashed_ids (possibly querying the wistia API,
  before insertion for example) would prevent junk entries from being created.
- Using a token for the PUT endpoints would also help secure the API.
- If other settings for media were introduced, adjusting the API to a more RESTful
  interface would be ideal. A `PUT` endpoint for `medias/:id` that would take
  a payload of any subset of data (such as visibility).
- Given additional complexity, I'd probably break the routes themselves into their
  own files and wire them up in the index file.

## Search By Tag

This presumes Postgres syntax.

_Disclaimer: I haven't written SQL in a couple years so please excuse any clunkiness._

### Tags schema

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
