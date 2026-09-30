"""Mux rendered frames + score into the delivery MP4 and export anchor stills.

    python3 encode.py [frames_dir] [out.mp4]
"""
import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
from PIL import Image

FPS = 30
frames = Path(sys.argv[1] if len(sys.argv) > 1 else 'frames/16x9')
out = sys.argv[2] if len(sys.argv) > 2 else 'sparkstack-launch-16x9.mp4'
ff = imageio_ffmpeg.get_ffmpeg_exe()

count = len(list(frames.glob('f*.png')))
assert count == 450, f'expected 450 frames, found {count}'

subprocess.run([
    ff, '-y', '-hide_banner', '-loglevel', 'error',
    '-framerate', str(FPS), '-i', str(frames / 'f%04d.png'),
    '-i', 'score.wav',
    # sRGB PNG → BT.709 limited-range YUV, tagged to match, so colours survive.
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-profile:v', 'high',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
    '-shortest', '-movflags', '+faststart', out,
], check=True)
print('wrote', out)

# Skill step 6: three standalone anchor frames taken from the film itself.
anchors = Path('anchors')
anchors.mkdir(exist_ok=True)
for name, t in (('01-hero', 5.6), ('02-material-detail', 6.1), ('03-final-copy', 13.6)):
    Image.open(frames / f'f{round(t * FPS):04d}.png').convert('RGB').save(anchors / f'{name}.jpg', quality=92)
print('wrote anchors/')
