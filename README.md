## Rotations

![cover-image](./images/cover-photo.png)

Rebuilding spotify from first principles.

Enhance your music listening experience with hand created
rotations.

What if you could have better control over your daily music rotation?

## What is Rotations?

rotations.locker is a msuic player that is import only.

Listening to a song will automatically add it into your Current Rotation.

Your current rotation determines the songs you listen to. You can decided 
what you want your rotation's radius to be and you will get recomended songs
outside of your rotation.

A few features:

- Add your music once and it is forever persisted. 
- Automatic offline mode. (All playlists and music are downlaoded the first time after they stream).
- Multi-rotation mode

Sources Supported:
- [X] Bandcamp
- [ ] Youtube (in progress)
- [ ] Spotify (in progress)
- [ ] Soundcloud (coming soon)
- [ ] Others (make an [issue here](github.com/cdxker/rotations))

## Developers

This is a frontend only web.

### Setup Local dev

```
cd site
yarn
# Hot reloaded local dev
yarn dev
```

### Building for production

```
cd site
# Compile the typescript
yarn build
# To view the website / serve content
yarn preview
```
