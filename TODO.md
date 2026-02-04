# TODO

## Skills & Workflow
- [ ] **Investigate background commit workflow** - Skills are designed for synchronous/blocking execution by default. If we want commits to run in the background while continuing work, we'd need to use Task tool instead of Skill tool. Task supports `run_in_background: true` but loses the skill's structured guidance. Worth exploring if there's value in async commit handling or if synchronous is sufficient (git commits are fast anyway). Consider whether we want a background-capable commit task or if current skill workflow is better.

## UI/Styling
- [ ] ToggleGroup border colors too high contrast in dark mode - needs subtler border
