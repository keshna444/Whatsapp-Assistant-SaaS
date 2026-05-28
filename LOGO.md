# LOGO SIZE OPTIMIZATION

## Current Situation

The new logo has been implemented successfully across the website.

However:

* the logo appears too small
* branding visibility is weak
* the navbar/logo area does not feel premium enough

Claude must improve the logo sizing while preserving:

* responsiveness
* clean spacing
* professional UI balance
* existing layout structure

---

# Objectives

## Increase Logo Visibility

The logo should:

* feel modern and premium
* be easily readable
* have stronger visual presence
* remain balanced with navbar elements

---

# Navbar Requirements

## Desktop

Increase logo size for desktop screens.

The logo should:

* be clearly visible
* occupy appropriate navbar space
* remain aligned vertically
* not overpower navigation items

Suggested sizing direction:

* larger height values
* responsive width scaling
* maintain aspect ratio

Example sizing direction:

* `h-10`
* `md:h-12`
* `lg:h-14`

Claude should determine the best final values based on the layout.

---

## Mobile

Improve mobile logo visibility without overcrowding the navbar.

Requirements:

* responsive scaling
* proper spacing with hamburger/menu buttons
* preserve clean mobile layout

---

# Sidebar Logo

## Expanded Sidebar

* increase full logo visibility
* maintain padding consistency

## Collapsed Sidebar

* ensure icon logo remains readable
* center icon properly

---

# Auth Pages

Increase logo prominence on:

* login page
* signup page
* onboarding screens

The branding should feel stronger and more professional.

---

# Footer

Adjust footer logo size appropriately based on footer layout.

---

# Technical Requirements

Claude should:

* preserve aspect ratio
* avoid stretching/distortion
* maintain transparent backgrounds
* ensure retina-quality rendering
* use responsive Tailwind classes if applicable

If Tailwind is used:

* optimize `h-*`
* optimize `w-*`
* use responsive breakpoints

---

# Important

Do NOT:

* break navbar alignment
* create overflow issues
* reduce responsiveness
* distort logo proportions

---

# Final Verification

After implementation:

* verify desktop responsiveness
* verify mobile responsiveness
* verify dark/light mode appearance
* verify spacing consistency
* verify visual hierarchy feels premium

Claude should explain:

* which sizing classes were modified
* which components/files were updated
* how responsiveness was improved
