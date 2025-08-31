#!/bin/bash

unzip -o site.pmp -d assets

echo "Making small images..."
    create_resized_images() {
        find data/ -name "*.png" -type f \( -not -path "data/comics/*" -o -path "data/comics/*Thumb.png" \) | while read -r image; do
            dir=$(dirname "$image")
            filename=$(basename "$image" .png)
            small_image="${dir}/${filename}small.png"
            medium_image="${dir}/${filename}medium.png"

            if [[ "$filename" == *"small" || "$filename" == *"medium" ]]; then
                continue
            fi

            if command -v magick >/dev/null 2>&1; then
                magick "$image" -resize 230x180^ -gravity center -extent 230x180 "$small_image"
                magick "$image" -resize 459x360^ -gravity center -extent 459x360 "$medium_image"
            else
                break
            fi
        done
    }

    create_resized_images
