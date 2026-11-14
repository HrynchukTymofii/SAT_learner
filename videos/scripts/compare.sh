#!/bin/sh
# Side-by-side check of a remake against its reference video:
#   sh scripts/compare.sh <composition> <reference.mp4> <sec,sec,...> <out.png>
# Top row: reference; bottom row: the remake, at the same seconds.
id=$1; ref=$2; secs=$3; out=$4
tmp=$(mktemp -d)
i=0; inputs=""
for t in $(echo $secs | tr ',' ' '); do
  ffmpeg -loglevel error -y -ss $t -i "$ref" -frames:v 1 -vf scale=540:960 $tmp/r$i.png
  inputs="$inputs -i $tmp/r$i.png"; i=$((i+1))
done
ffmpeg -loglevel error -y $inputs -filter_complex "hstack=inputs=$i" $tmp/top.png
npx tsx scripts/review.ts $id $secs > /dev/null
ffmpeg -loglevel error -y -i $tmp/top.png -i out/review/$id.png -filter_complex "[1]scale=iw:ih[b];[0][b]vstack" "$out"
rm -rf $tmp
echo "$out"
