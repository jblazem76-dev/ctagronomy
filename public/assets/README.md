# Assets (not in this repo yet)

The design handoff ships images, label PDFs and fonts in a separate bundle
(`design_handoff_cta_website/assets/`). Copy its contents into this folder so
paths such as `/assets/cta-logo.png`, `/assets/jugs/humic.png` and
`/assets/labels/humic-front.pdf` resolve. Until then the site builds and runs,
but images and PDFs 404 (jug images fall back to a turf photo, which is also
missing).
