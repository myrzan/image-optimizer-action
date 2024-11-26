# Image Optimizer Action

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/cadamsdev/notes/issues) ![GitHub License](https://img.shields.io/github/license/cadamsdev/image-optimizer-action) ![GitHub Tag](https://img.shields.io/github/v/tag/cadamsdev/image-optimizer-action)



A GitHub action that optimizes images. A free and open source alternative to [imgbot](https://imgbot.net/). This GitHub action supports compressing PNG, JPG / JPEG, WEBP, AVIF and SVG.

This tool is completely free. If you enjoy the tool please help support us.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/cadamsdev)

# Usage

## Pull request workflow

Create file .github/workflows/image-optimizer.yml
```yml
name: Compress Images

on:
  pull_request:
    paths:
      - '**/*.svg'
      - '**/*.png'
      - '**/*.jpg'
      - '**/*.jpeg'
      - '**/*.webp'
      - '**/*.avif'

jobs:
  build:
    if: github.event.pull_request.head.repo.full_name == github.repository
    name: cadamsdev/image-optimizer-action
    permissions: write-all
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4
      - name: Compress Images
        id: compress-images
        uses: cadamsdev/image-optimizer-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Report Results
        if: steps.compress-images.outputs.terminal_report != ''
        run: echo "${{ steps.compress-images.outputs.terminal_report }}"

```

## Manual Workflow

Create file .github/workflows/image-optimizer-manual.yml
```yml
name: Compress Images (Manual)

on:
  workflow_dispatch

jobs:
  build:
    name: cadamsdev/image-optimizer-action
    permissions: write-all
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Compress Images
        id: compress-images
        uses: cadamsdev/image-optimizer-action@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Report Results
        if: steps.compress-images.outputs.terminal_report != ''
        run: echo "${{ steps.compress-images.outputs.terminal_report }}"
      - name: Create New Pull Request If Needed
        if: steps.compress-images.outputs.markdown_report != ''
        uses: peter-evans/create-pull-request@v5
        with:
          title: Compressed Images
          branch-suffix: timestamp
          commit-message: Compressed Images
          body: ${{ steps.compress-images.outputs.markdown_report }}

```
