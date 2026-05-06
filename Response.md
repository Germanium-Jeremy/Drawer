# Fixes for Missing Drawing Commands

## What was broken?
The **`parser.ts`** had been refactored, but the **`drawEngine.ts`** only implemented a subset of the commands that the parser can produce.  As a result, commands such as:
- `ARC`
- `ELLIPSE`
- `POLYGON`
were parsed correctly but never caused any drawing on the canvas.  The `CIRCLE` case also had a minor indentation issue.

## Changes made
1. **`src/logic/drawEngine.ts`**
   * Fixed the indentation for the existing `CIRCLE` case (purely cosmetic, but improves readability).
   * Added handling for the new command types:
     * **`ARC`** – calls `canvas.drawArc` with the supplied radius, start‑angle and end‑angle.
     * **`ELLIPSE`** – calls `canvas.drawEllipse` with the supplied radii.
     * **`POLYGON`** – calls `canvas.drawPolygon` with the parsed point list.
   * Each new case respects the current pen‑down state, mirroring the behaviour of the other drawing commands.

2. No changes were required in `parser.ts` because it already emitted the appropriate command objects.

## Result
After these updates, any script that issues `arc`, `ellipse`, or `polygon` (or their short forms) will now render the expected shapes on the canvas.

You can now test the commands, for example:
```
repeat 4 [ forward 100 right 90 ]
color #ff0000
polygon [ 200 200 300 200 250 300 ]
arc 50 0 180
ellipse 60 30
```
All shapes should appear correctly.

---
*File changes were applied directly to the source files.  Further testing can be done with the UI or by running the app.*