#!/usr/bin/env bash

for f in *.ttf; do
dst="${f:0:${#f}-4}"
rm $dst/index.json 2>/dev/null; rm $dst/atlas.png 2>/dev/null; mkdir $dst 2>/dev/null
msdf-atlas-gen -font $f -json $dst/index.json -imageout $dst/atlas.png -size 64 -pxrange 5
done