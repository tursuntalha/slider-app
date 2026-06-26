# Slider App — React Slider & Carousel Component Library

![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CSS Modules](https://img.shields.io/badge/CSS%20Modules-1572B6?style=for-the-badge&logo=css3&logoColor=white)

A lightweight, customizable React carousel and slider component library with smooth animations, touch/swipe support, and zero external dependencies.

---

## Planned Components

### `<ImageCarousel />`
Auto-playing image carousel with navigation arrows, dot indicators, and infinite loop.

```jsx
<ImageCarousel
  images={['/img1.jpg', '/img2.jpg', '/img3.jpg']}
  autoPlay
  interval={3000}
  showDots
  showArrows
  infinite
/>
```

### `<ContentSlider />`
Accepts any React children as slides — cards, text, custom components.

```jsx
<ContentSlider slidesPerView={3} gap={16}>
  <Card title="Item 1" />
  <Card title="Item 2" />
  <Card title="Item 3" />
  <Card title="Item 4" />
</ContentSlider>
```

### `<RangeSlider />`
Single and dual-handle range input with custom styling and value labels.

```jsx
<RangeSlider
  min={0}
  max={1000}
  value={[200, 800]}
  onChange={([min, max]) => setPrice([min, max])}
  label="Price Range"
/>
```

### `<TestimonialSlider />`
Card-based testimonial display with auto-scroll and smooth transitions.

---

## Features

- Touch and swipe support (mobile-friendly)
- Keyboard navigation (arrow keys)
- Responsive breakpoints — configure `slidesPerView` per breakpoint
- Custom animation easing (ease-in-out, spring, linear)
- Zero external dependencies (pure React + CSS)
- Full TypeScript support
- Tree-shakeable — import only what you use

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Styling | CSS Modules (no Styled Components, no Emotion) |
| Build | Rollup → ESM + CJS + UMD |
| Testing | React Testing Library + Jest |
| Demo | Storybook |

---

## Installation (planned)

```bash
npm install slider-app
# or
yarn add slider-app
```

---

## Roadmap

| Phase | Task | Status |
|-------|------|--------|
| Phase 1 | `<ImageCarousel>` — arrows, dots, autoplay, infinite | [ ] |
| Phase 2 | Touch/swipe gesture detection | [ ] |
| Phase 3 | `<ContentSlider>` — multi-slide, responsive breakpoints | [ ] |
| Phase 4 | `<RangeSlider>` — single + dual handle | [ ] |
| Phase 5 | `<TestimonialSlider>` — card layout + auto-scroll | [ ] |
| Phase 6 | Keyboard navigation + accessibility (ARIA) | [ ] |
| Phase 7 | TypeScript definitions | [ ] |
| Phase 8 | Storybook documentation | [ ] |
| Phase 9 | Rollup build + npm publish | [ ] |
| Phase 10 | Demo site (GitHub Pages) | [ ] |
