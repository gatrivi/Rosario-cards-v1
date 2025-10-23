# General Rules

- Assume all questions are about the proect unless "vscode" or "continue" or "qwen" are specifically mentioned. e.g.> if I say "why is the sound engine not working" > search for compoments in the proect that play sound and find out why they might be malfunctioning.

# Project Architecture

This is a React application with:

- Components in `/src/components`
- Prayers in `/src/data/RosarioPrayerBook.js`

- Images in `/public/gallery-images`

- Interactive Rosary in `/src/components/RosarioNube`
- View Prayers in `/src/components/ViewPrayers`

## Coding Standards

- Use React for all new files
- Follow the existing naming conventions
- Write tests for all new features
- Start with simplest implementation, see if it works, and start to move towards best practices one step and one test at a time.

## Proyect Plan

- App is mostly for people to be able to recite the rosary when they don't have a rosary or know the prayers. So the first core function is being able to go through the prayers, the second is an interactive rosary that helps to keep track of position and what type of prayer comes next. So it's important that prayers can be accessed, and in the right sequence.
- The primary mode of navigating through prayers is through the interactive rosary. That mimics how its actually done with the physical rosary. The idea is as you hold beads you can see the corresponding prayers. So it's important that beads and sections trigger the right prayers.
- Background images and some effects around the beads are there to provide harrowing beauty to help user inmerse in prayers. So it's important that all prayers render images.

## Resources

- Images, prayers sequence and whatnot can be accessed from https://ourladyofgracerosaries.ca/visual-rosary-opening-prayers/ but our version is in Spanish
