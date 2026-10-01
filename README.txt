FutureScape (Vite)
===================

This project was bootstrapped with Vite (https://vite.dev/) using the
React template.

Available Scripts
------------------

In the project directory, you can run:

npm run dev
  Runs the app in development mode using Vite's dev server.
  Open http://localhost:5173 to view it in your browser.
  The page will hot-reload when you make changes.

npm run build
  Builds the app for production to the "dist" folder.
  Vite bundles and minifies the app for the best performance, with
  hashed filenames for cache-busting.

npm run preview
  Locally serves the production build from "dist", so you can
  sanity-check the build before deploying it.

API Server
----------

This app talks to a local Python API server (server.py) in the Preview step.

Project Structure
------------------

src/
  App.jsx              Main app shell / screen routing
  Navbar.jsx           Top navigation
  OnboardingFlow.jsx   Onboarding screen
  UploadPage.jsx       Image upload + detection call
  PreviewPage.jsx      Preview screen
  BoardViewPage.jsx    Board view (uses d3)
  doodles.jsx          Decorative doodle components
  main.jsx             Vite entry point
  index.css            Global styles

Learn More
----------

Vite documentation: https://vite.dev/guide/
React documentation: https://react.dev/
