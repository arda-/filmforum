# Preferred Blur Settings

## Text-Relative Blur (Recommended)

The following settings produce the optimal blur effect for movie poster cards with text overlays:

### Configuration
- **Mode**: Text-relative blur sizing
- **Radius**: 1.5rem (24px)
- **Scrim**: Enabled
- **100% blur until**: 0.35× (35% of text overlay height)
- **Blur ends at**: 0.95× (95% of text overlay height)

### Effect
This configuration creates a smooth blur gradient that:
- Starts with maximum blur at the bottom edge
- Maintains full blur intensity up to 35% of the text height
- Gradually fades the blur from 35% to 95% of text height
- Creates a scrim (darkening overlay) that enhances text readability
- Adapts automatically to different text content amounts

### URL Parameters
To apply these settings in the blur-simple demo:
```
/demo/blur-simple?blur=24&rel_full_mult=0.35&rel_end_mult=0.95&scrim=1
```

### Implementation Notes
- Text-relative mode scales blur boundaries based on the text overlay's actual height
- Works across all aspect ratios (2:1, 16:9, 4:3, 1:1, 3:4, 2:3, 9:16, 1:2)
- Scrim uses `rgba(10, 10, 10, 0.6)` with `mix-blend-mode: darken`
- Blur radius of 1.5rem = 24px provides good balance between readability and performance

### When to Use
- Movie poster cards with text overlays
- Image cards where text readability is critical
- Situations where text content varies in length
- Responsive designs where card sizes change
