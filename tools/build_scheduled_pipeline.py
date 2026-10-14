import os
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS_DIR = os.path.join(REPO_ROOT, "tools")
APP_SCREENS_DIR = os.path.join(TOOLS_DIR, "app_screens")
LOCAL_FONTS_DIR = os.path.join(TOOLS_DIR, "fonts")

DEFAULT_SOCIAL_DIR = r"C:\Users\giana\Desktop\TerroirTrail\TerroirTrail Social"
if os.path.exists(DEFAULT_SOCIAL_DIR):
    BASE_DIR = os.environ.get("TERROIR_SOCIAL_DIR", DEFAULT_SOCIAL_DIR)
else:
    BASE_DIR = os.environ.get("TERROIR_SOCIAL_DIR", os.path.join(REPO_ROOT, "staging", "pipeline"))

PIPELINE_DIR = os.path.join(BASE_DIR, "Scheduled_Pipeline")
os.makedirs(PIPELINE_DIR, exist_ok=True)

LOCAL_FONT = os.path.join(LOCAL_FONTS_DIR, "RobotoSlab-Bold.ttf")
EXTERNAL_FONT = os.path.join(DEFAULT_SOCIAL_DIR, r"Instagram\Reels\3rd Reel\90_Working\_RobotoSlab_700.ttf")
FONT_BOLD = LOCAL_FONT if os.path.exists(LOCAL_FONT) else EXTERNAL_FONT

LOGO_PATH = os.path.join(REPO_ROOT, "assets", "logo.png")

DEFAULT_APP_SCREEN = os.path.join(APP_SCREENS_DIR, "Europe.png")
CRETE_APP_SCREEN = os.path.join(APP_SCREENS_DIR, "Crete.png")

W, H = 1080, 1350
WHITE = (248, 247, 243, 255)
AMBER = (242, 161, 29, 255)
SHADOW = (0, 0, 0, 210)


def fnt(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD, size)


def cover_crop(img: Image.Image, target_w: int, target_h: int, ax: float = 0.5, ay: float = 0.5) -> Image.Image:
    img = img.convert("RGB")
    sw, sh = img.size
    scale = max(target_w / sw, target_h / sh)
    nw, nh = int(round(sw * scale)), int(round(sh * scale))
    resized = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = int(round((nw - target_w) * ax))
    top = int(round((nh - target_h) * ay))
    left = max(0, min(nw - target_w, left))
    top = max(0, min(nh - target_h, top))
    return resized.crop((left, top, left + target_w, top + target_h))


def apply_scrim(base_rgb: Image.Image, top_alpha: int = 155, mid_alpha: int = 40, bot_alpha: int = 205, left_scrim: int = 110) -> Image.Image:
    base = base_rgb.convert("RGBA")
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = grad.load()
    for y in range(H):
        t = y / (H - 1)
        if t < 0.35:
            u = t / 0.35
            a = int(top_alpha * (1 - u) + mid_alpha * u)
        elif t < 0.60:
            a = mid_alpha
        else:
            u = (t - 0.60) / 0.40
            a = int(mid_alpha * (1 - u) + bot_alpha * u)
        for x in range(W):
            la = 0
            if left_scrim > 0 and x < int(W * 0.78):
                lu = 1.0 - (x / (W * 0.78))
                la = int(left_scrim * (lu ** 1.25))
            px[x, y] = (8, 7, 6, min(230, max(a, la)))
    return Image.alpha_composite(base, grad)


def draw_text_bold(canvas: Image.Image, xy: tuple, text: str, font: ImageFont.FreeTypeFont, fill=WHITE, shadow_offset=(0, 4), blur=7):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    sx, sy = xy[0] + shadow_offset[0], xy[1] + shadow_offset[1]
    d.text((sx, sy), text, font=font, fill=SHADOW, stroke_width=2, stroke_fill=(0, 0, 0, 180))
    layer = layer.filter(ImageFilter.GaussianBlur(blur))
    d2 = ImageDraw.Draw(layer)
    d2.text(xy, text, font=font, fill=fill, stroke_width=1, stroke_fill=fill)
    canvas.alpha_composite(layer)


def draw_mixed_line(canvas: Image.Image, x: int, y: int, segments: list, align: str = "left"):
    temp_d = ImageDraw.Draw(canvas)
    widths = [temp_d.textlength(txt, font=fn) + (3 if len(segments) > 1 else 0) for txt, _, fn in segments]
    total_w = sum(widths)
    cur_x = x
    if align == "right":
        cur_x = int(round(x - total_w))
    elif align == "center":
        cur_x = int(round(x - total_w / 2))
    for (txt, col, fn), w in zip(segments, widths):
        draw_text_bold(canvas, (int(round(cur_x)), y), txt, fn, fill=col)
        cur_x += w


def draw_brand_header(canvas: Image.Image, center_x: int = 540, top_y: int = 44, scale: float = 1.0):
    logo = Image.open(LOGO_PATH).convert("RGBA")
    lw = int(round(124 * scale))
    lh = int(round(logo.height * (lw / logo.width)))
    logo_r = logo.resize((lw, lh), Image.Resampling.LANCZOS)

    f_title = fnt(int(round(90 * scale)))
    f_sub = fnt(int(round(40 * scale)))
    d = ImageDraw.Draw(canvas)
    w_terroir = d.textlength("Terroir", font=f_title)
    w_trail = d.textlength("Trail", font=f_title)
    gap = int(round(24 * scale))
    block_w = lw + gap + w_terroir + w_trail
    start_x = int(round(center_x - block_w / 2))

    logo_shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    alpha = logo_r.split()[3]
    sh_img = Image.new("RGBA", logo_r.size, (0, 0, 0, 165))
    sh_img.putalpha(alpha)
    logo_shadow.paste(sh_img, (start_x, top_y + 4), sh_img)
    logo_shadow = logo_shadow.filter(ImageFilter.GaussianBlur(6))
    canvas.alpha_composite(logo_shadow)
    canvas.alpha_composite(logo_r, (start_x, top_y))

    tx = start_x + lw + gap
    ty = top_y - int(round(6 * scale))
    draw_mixed_line(canvas, tx, ty, [
        ("Terroir", WHITE, f_title),
        ("Trail", AMBER, f_title),
    ])
    sub_y = ty + int(round(98 * scale))
    draw_text_bold(canvas, (tx - int(round(6 * scale)), sub_y), "Travel deeper. Taste local", f_sub, fill=WHITE)


def draw_accent_bar(canvas: Image.Image, x: int, y: int, width: int = 135, height: int = 7):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rounded_rectangle([x, y, x + width, y + height], radius=3, fill=AMBER)
    canvas.alpha_composite(layer)


def draw_wrapped_body(canvas: Image.Image, x: int, y: int, lines: list, font_size: int = 45, line_gap: int = 66, max_w: int = None):
    cur_y = y
    fn = fnt(font_size)
    temp_d = ImageDraw.Draw(canvas)

    final_lines = []
    if max_w is not None:
        for line_parts in lines:
            tot_w = sum(temp_d.textlength(txt, font=fn) + (3 if len(line_parts) > 1 else 0) for txt, _ in line_parts)
            if tot_w <= max_w:
                final_lines.append(line_parts)
            else:
                # Word-wrap segments into multiple lines
                cur_line = []
                cur_w = 0
                for txt, col in line_parts:
                    words = txt.split(" ")
                    for i, w in enumerate(words):
                        w_str = w + (" " if i < len(words) - 1 else "")
                        w_len = temp_d.textlength(w_str, font=fn) + 2
                        if cur_line and (cur_w + w_len > max_w):
                            final_lines.append(cur_line)
                            cur_line = [(w_str, col)]
                            cur_w = w_len
                        else:
                            cur_line.append((w_str, col))
                            cur_w += w_len
                if cur_line:
                    final_lines.append(cur_line)
    else:
        final_lines = lines

    # Adjust line_gap if wrapped lines exceed available vertical space
    effective_gap = line_gap
    if len(final_lines) > 5:
        effective_gap = max(38, int(line_gap * 5 / len(final_lines)))

    for line_parts in final_lines:
        segs = [(txt, col, fn) for txt, col in line_parts]
        draw_mixed_line(canvas, x, cur_y, segs, align="left")
        cur_y += effective_gap
    return cur_y


def render_flagship_slide_1(bg_path: str, title_white: str, title_amber: str, teaser_lines: list, ax: float = 0.5, ay: float = 0.5) -> Image.Image:
    src = Image.open(bg_path)
    bg = cover_crop(src, W, H, ax=ax, ay=ay)
    bg = ImageEnhance.Contrast(bg).enhance(1.07)
    canvas = apply_scrim(bg, top_alpha=155, mid_alpha=60, bot_alpha=195, left_scrim=85)

    draw_brand_header(canvas, center_x=525, top_y=40, scale=0.98)

    d = ImageDraw.Draw(canvas)
    f_big = fnt(94)

    # Guard title lines from overflowing right edge
    w_w = d.textlength(title_white, font=f_big)
    f_w = f_big if 54 + w_w <= W - 50 else fnt(int(round(94 * (W - 110) / w_w)))
    draw_text_bold(canvas, (54, 380), title_white, f_w, fill=WHITE)

    w_a = d.textlength(title_amber, font=f_big)
    f_a = f_big if 54 + w_a <= W - 50 else fnt(int(round(94 * (W - 110) / w_a)))
    draw_text_bold(canvas, (54, 500), title_amber, f_a, fill=AMBER)

    draw_accent_bar(canvas, 58, 645, width=140, height=7)

    f_bot = fnt(74)
    y_pos = 875
    for parts in teaser_lines:
        tot_w = sum(d.textlength(txt, font=f_bot) + 3 for txt, _ in parts)
        # Guard teaser from overflowing left margin (max allowed width 760px)
        curr_f = f_bot
        if tot_w > 760:
            curr_f = fnt(max(44, int(round(74 * 760.0 / tot_w))))
        segs = [(txt, col, curr_f) for txt, col in parts]
        draw_mixed_line(canvas, W - 52, y_pos, segs, align="right")
        y_pos += 115

    return canvas.convert("RGB")


def render_flagship_content_slide(bg_path: str, head_white: str, head_amber: str, body_lines: list, ax: float = 0.5, ay: float = 0.5) -> Image.Image:
    src = Image.open(bg_path)
    bg = cover_crop(src, W, H, ax=ax, ay=ay)
    bg = ImageEnhance.Contrast(bg).enhance(1.06)
    canvas = apply_scrim(bg, top_alpha=155, mid_alpha=35, bot_alpha=205, left_scrim=110)

    d = ImageDraw.Draw(canvas)
    f_h = fnt(80)
    w_hw = d.textlength(head_white, font=f_h)
    f_hw = f_h if 62 + w_hw <= W - 50 else fnt(int(round(80 * (W - 120) / w_hw)))
    draw_text_bold(canvas, (62, 105), head_white, f_hw, fill=WHITE)

    w_ha = d.textlength(head_amber, font=f_h)
    f_ha = f_h if 62 + w_ha <= W - 50 else fnt(int(round(80 * (W - 120) / w_ha)))
    draw_text_bold(canvas, (62, 205), head_amber, f_ha, fill=AMBER)
    draw_accent_bar(canvas, 66, 325, width=135, height=7)

    draw_wrapped_body(canvas, 62, 910, body_lines, font_size=45, line_gap=66, max_w=W - 50 - 62)
    return canvas.convert("RGB")


def render_flagship_slide_6(bg_path: str, app_screen_path: str, region_name: str, body_lines: list, ax: float = 0.5, ay: float = 0.5) -> Image.Image:
    src = Image.open(bg_path)
    bg = cover_crop(src, W, H, ax=ax, ay=ay)
    bg = ImageEnhance.Contrast(bg).enhance(1.06)
    base = bg.convert("RGBA")
    grad = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    px = grad.load()
    for y in range(H):
        for x in range(W):
            rx = max(0.0, (x - 340) / (W - 340))
            a = int(75 + 130 * (rx ** 0.85))
            if y < 260:
                a = max(a, int(135 * (1 - y / 260)))
            px[x, y] = (8, 7, 6, min(225, a))
    canvas = Image.alpha_composite(base, grad)

    # Phone mockup on the left
    screen_src = app_screen_path if os.path.exists(app_screen_path) else DEFAULT_APP_SCREEN
    screen_img = Image.open(screen_src).convert("RGBA")
    pw, ph = 488, 1126
    px_left, py_top = 20, 96
    bezel = 13
    radius = 44

    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle([px_left - 4, py_top + 8, px_left + pw + 8, py_top + ph + 16], radius=radius + 4, fill=(0, 0, 0, 185))
    sh = sh.filter(ImageFilter.GaussianBlur(14))
    canvas.alpha_composite(sh)

    body = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([px_left, py_top, px_left + pw, py_top + ph], radius=radius, fill=(10, 10, 10, 255), outline=(45, 42, 38, 255), width=2)
    canvas.alpha_composite(body)

    sw, sh_inner = pw - bezel * 2, ph - bezel * 2
    scr_resized = screen_img.resize((sw, sh_inner), Image.Resampling.LANCZOS)
    mask = Image.new("L", (sw, sh_inner), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, sw, sh_inner], radius=radius - bezel, fill=255)
    canvas.paste(scr_resized, (px_left + bezel, py_top + bezel), mask)

    # Top-right brand header
    draw_brand_header(canvas, center_x=795, top_y=70, scale=0.76)

    # Right column headline & copy in Roboto Slab Bold with #f2a11d emphasis
    rx = 538
    d = ImageDraw.Draw(canvas)
    f_h = fnt(62)
    draw_text_bold(canvas, (rx, 250), "Go deeper into", f_h, fill=WHITE)

    # Guard region name width
    w_reg = d.textlength(region_name, font=f_h)
    f_reg = f_h if rx + w_reg <= W - 40 else fnt(int(round(62 * (W - 40 - rx) / w_reg)))
    draw_text_bold(canvas, (rx, 330), region_name, f_reg, fill=AMBER)
    draw_accent_bar(canvas, rx + 2, 420, width=160, height=6)

    # Right column text width is strictly clamped to W - 40 - rx (502px)
    draw_wrapped_body(canvas, rx, 458, body_lines, font_size=39, line_gap=58, max_w=W - 40 - rx)

    f_cta_label = fnt(42)
    f_cta_url = fnt(43)
    draw_text_bold(canvas, (rx, 760), "Explore the map:", f_cta_label, fill=WHITE)
    draw_text_bold(canvas, (rx, 822), "terroir-trail.web.app", f_cta_url, fill=AMBER)

    return canvas.convert("RGB")

print("Flagship Pipeline Helper Loaded.")
