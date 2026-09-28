"""Per-frame analysis of the source clip.

Outputs (in ./analysis):
  face.json          per-frame face centre / size (normalised 0..1), raw + smoothed
  masks/NNNN.png     full-res person alpha mask (RGBA, black w/ alpha), guided-filter refined,
                     temporally smoothed — used for text-behind-subject compositing
"""
import json, os, subprocess, sys
import numpy as np, cv2
import mediapipe as mp
from mediapipe.tasks import python as mpp
from mediapipe.tasks.python import vision

SRC = "graded_frames"          # JPEG frames already extracted (1080x1920)
OUT = "analysis"
W, H = 1080, 1920
os.makedirs(f"{OUT}/masks", exist_ok=True)

frames = sorted(f for f in os.listdir(SRC) if f.endswith(".jpg"))
FPS = 30.0

face_opts = vision.FaceLandmarkerOptions(
    base_options=mpp.BaseOptions(model_asset_path="models/face_landmarker.task"),
    running_mode=vision.RunningMode.VIDEO, num_faces=1)
face = vision.FaceLandmarker.create_from_options(face_opts)

seg_opts = vision.ImageSegmenterOptions(
    base_options=mpp.BaseOptions(model_asset_path="models/selfie_multiclass_256x256.tflite"),
    running_mode=vision.RunningMode.VIDEO, output_confidence_masks=True, output_category_mask=False)
seg = vision.ImageSegmenter.create_from_options(seg_opts)


def guided_filter(I, p, r, eps):
    """He et al. fast guided filter (grayscale guide)."""
    mean = lambda x: cv2.boxFilter(x, -1, (r, r))
    mI, mp_ = mean(I), mean(p)
    cov = mean(I * p) - mI * mp_
    var = mean(I * I) - mI * mI
    a = cov / (var + eps)
    b = mp_ - a * mI
    return mean(a) * I + mean(b)


faces = []
prev_alpha = None
for i, fn in enumerate(frames):
    bgr = cv2.imread(f"{SRC}/{fn}")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    img = mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(rgb))
    ts = int(round(i * 1000 / FPS))

    fr = face.detect_for_video(img, ts)
    if fr.face_landmarks:
        pts = np.array([[p.x, p.y] for p in fr.face_landmarks[0]])
        x0, y0 = pts.min(0); x1, y1 = pts.max(0)
        # 10 = forehead top, 152 = chin, 468/473 = iris centres
        eyes = (pts[468] + pts[473]) / 2 if len(pts) > 473 else pts[[33, 263]].mean(0)
        mouth_open = float(np.linalg.norm(pts[13] - pts[14]) / max(1e-6, (y1 - y0)))
        faces.append(dict(ok=True, cx=float((x0 + x1) / 2), cy=float((y0 + y1) / 2),
                          w=float(x1 - x0), h=float(y1 - y0), ex=float(eyes[0]), ey=float(eyes[1]),
                          top=float(y0), mouth=mouth_open))
    else:
        faces.append(dict(ok=False))

    sr = seg.segment_for_video(img, ts)
    bg = sr.confidence_masks[0].numpy_view().astype(np.float32)
    if bg.ndim == 3: bg = bg[..., 0]
    if bg.shape != (H, W): bg = cv2.resize(bg, (W, H), interpolation=cv2.INTER_LINEAR)
    alpha = 1.0 - bg
    # refine edges against the image itself (hair vs. bright headliner)
    small = cv2.resize(rgb, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    guide = cv2.cvtColor(small, cv2.COLOR_RGB2GRAY).astype(np.float32) / 255.0
    a_small = cv2.resize(alpha, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    a_ref = guided_filter(guide, a_small, 12, 1e-3)
    a_ref = cv2.resize(a_ref, (W, H), interpolation=cv2.INTER_CUBIC)
    a_ref = np.clip((a_ref - 0.15) / 0.7, 0, 1)          # tighten the soft ramp
    if prev_alpha is not None:                            # light temporal smoothing kills flicker
        a_ref = 0.65 * a_ref + 0.35 * prev_alpha
    prev_alpha = a_ref
    rgba = np.zeros((H, W, 4), np.uint8)
    rgba[..., 3] = (a_ref * 255).astype(np.uint8)
    cv2.imwrite(f"{OUT}/masks/{i:04d}.png", rgba, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    if i % 30 == 0:
        print(i, faces[-1].get("cx"), faces[-1].get("cy"), faces[-1].get("h"), flush=True)

# fill gaps + smooth (zero-phase, so the camera "anticipates" rather than lags)
keys = ["cx", "cy", "w", "h", "ex", "ey", "top", "mouth"]
n = len(faces)
arr = {k: np.array([f.get(k, np.nan) for f in faces], float) for k in keys}
for k in keys:
    v = arr[k]; idx = np.arange(n); good = ~np.isnan(v)
    arr[k] = np.interp(idx, idx[good], v[good])


def smooth(v, sigma):
    r = int(sigma * 3)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2); k /= k.sum()
    return np.convolve(np.pad(v, r, mode="edge"), k, mode="valid")


out = dict(fps=FPS, n=n, width=W, height=H,
           raw={k: arr[k].round(5).tolist() for k in keys},
           smooth={k: smooth(arr[k], 9).round(5).tolist() for k in keys})
json.dump(out, open(f"{OUT}/face.json", "w"))
print("done", n)
