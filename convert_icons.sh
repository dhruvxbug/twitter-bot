#!/bin/bash

# This script converts SVG icons to PNG format for Chrome extension compatibility

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Error: ImageMagick is required but not installed."
    echo "Please install it using: brew install imagemagick"
    exit 1
 fi

# Create PNG directory if it doesn't exist
mkdir -p images/png

# Convert SVG to PNG
convert -background none -density 300 images/icon16.svg images/icon16.png
convert -background none -density 300 images/icon48.svg images/icon48.png
convert -background none -density 300 images/icon128.svg images/icon128.png

# Copy PNG files to the right location
cp images/icon16.png images/icon16.png
cp images/icon48.png images/icon48.png
cp images/icon128.png images/icon128.png

echo "Conversion complete. PNG icons are ready."