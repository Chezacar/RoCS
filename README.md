# Project page (anonymous)

Static site: open `index.html` directly or serve the folder from any sub-path. No build step, no external requests, relative paths only.

```
index.html
assets/css/style.css         styles (light and dark via prefers-color-scheme)
assets/js/data.js            all task data and the five real-robot slots
assets/js/site.js            renders the gallery and the video slots
assets/gallery/*.jpg         45 initial-scene images, 640x480, no metadata
assets/real/                 real-robot videos go here
tools/make_gallery_images.py rebuilds assets/gallery from the raw frames
```

## Add a real-robot video

Save it as `assets/real/<task_id>.mp4`, with `<task_id>` one of
`stack_cylinder_on_cube`, `doll_to_plate`, `cylinder_to_plate`, `wipe_with_towel`, `open_drawer_place_part`.
The page finds the file on load and swaps the poster for a player; nothing else needs editing
(optionally set `caption` for that entry in `assets/js/data.js`, e.g. "Head camera, 8x speed").

```
ffmpeg -i head.mp4 -an -vf "setpts=PTS/8,fps=30,scale=-2:'min(720,ih)':flags=lanczos" \
  -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -profile:v high \
  -movflags +faststart -map_metadata -1 -map_chapters -1 assets/real/<task_id>.mp4
```

`setpts=PTS/8` plays at 8x speed; pick the factor so the clip lasts one to three minutes, and raise `-crf` if the file exceeds about 8 MB.
Prefer the head camera: the wrist cameras also film the room behind the table.

## Regenerate gallery images

```
python3 tools/make_gallery_images.py --src <task_gallery_assets folder with sim/ and real/>
```

## Before publishing

- Watch every video end to end: no faces, badges, desk or room labels, screens, QR codes, or signage.
- `grep -rniE "<your names>|<institution>|<cluster paths>|<internal hosts>|@[a-z0-9-]+\.(com|cn|org)" .` returns nothing, also over file names.
- Images and videos carry no metadata (`exiftool -a -G1 <file>` shows only technical fields).
- Delete `.DS_Store` and similar files; zip the folder contents, not a parent path.
