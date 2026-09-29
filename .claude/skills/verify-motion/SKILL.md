---
name: verify-motion
description: Check how a liquidcn interaction actually moves, by capturing slowed-down frames from the running playground and, when there is one, comparing them with frames from a reference screen recording (for example an iOS 26 video). Use after changing anything in liquid.css, liquid-motion.ts, liquid-press.ts, liquid-lens*.ts, or liquid-menu-morph.ts, when tuning springs or timings, or when asked whether a component feels like the reference.
---

# Verify motion

Unit and UI tests prove behavior. They cannot tell you whether the glass _feels_ right. Look at frames.

## 1. Capture the implementation

The playground must be running (`pnpm dev`, http://localhost:3000). Then:

```sh
node scripts/capture-motion.mjs                      # every scenario
node scripts/capture-motion.mjs tabs-tap menu-open   # just these
node scripts/capture-motion.mjs menu-close --slow 20 --out motion-frames
```

Scenarios: `tabs-tap`, `tabs-drag`, `menu-open`, `menu-close`, `button-morph`. Frames land in `motion-frames/<scenario>/` (git-ignored), and the script prints the virtual time of each frame. With ffmpeg available (on PATH, or `FFMPEG=/path/to/ffmpeg`), it also writes one contact sheet per scenario, `motion-frames/<scenario>.png`. Read the sheet image to review a whole sequence at once.

To add a scenario, add an entry to `scenarios` in `scripts/capture-motion.mjs`: the playground component, a `clock`, the element to frame, frame times in ms, and the action.

**Choosing the clock.** `spring` slows `requestAnimationFrame` and `performance.now` in the page; use it for anything spring-driven (lens, press, width morph). `css` slows CSS animations through the DevTools animation domain; use it for keyframes (menu unfold and fold). Do not combine them: the DevTools rate also delays frame timestamps, and springs then stall. If frames show nothing moving or a lens that vanishes, the wrong clock is the usual cause.

## 2. Extract the reference (optional)

Without ffmpeg, `python -m pip install --target <tmp> imageio-ffmpeg` provides a full binary at `imageio_ffmpeg.get_ffmpeg_exe()`. Playwright's bundled ffmpeg cannot decode MP4/HEVC.

```sh
# Overview: 2 frames per second, timestamped, 8 across
ffmpeg -i reference.mp4 -vf "fps=2,scale=292:-1,drawtext=text='%{pts\:hms}':x=6:y=6:fontsize=18:fontcolor=red:box=1,tile=8x2" sheet_%02d.jpg
# Zoom into one interaction: 12 fps, cropped to the control
ffmpeg -ss 0.9 -t 1.2 -i reference.mp4 -vf "fps=12,crop=1170:280:0:2250,scale=700:-1,tile=2x7" -frames:v 1 tabs.jpg
```

Find each interaction in the overview, then crop and zoom into it.

## 3. Compare

Compare phase by phase: press response, travel, the shape in flight, landing and overshoot, and how content appears. Note timings in ms for both sides. Record agreed numbers in `docs/design.md`, and gaps you are not fixing in `tasks.todo`.

Also check the same interaction with reduced motion (it must still work, without movement), in dark material, and on a touch profile.
