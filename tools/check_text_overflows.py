import sys
import os
from PIL import Image, ImageDraw

sys.path.append('tools')
import generate_all_weeks
from build_scheduled_pipeline import fnt, W, H

d = ImageDraw.Draw(Image.new('RGB', (W, H)))

print("=== CHECKING ALL TEXT WIDTHS & OVERFLOWS ===")
overflow_count = 0

for item in generate_all_weeks.WEEKS:
    if 'slide_1' not in item:
        continue
    folder = item['folder']
    print(f"\n--- {folder} ---")
    
    # Slide 1
    s1 = item['slide_1']
    for t in [s1['title_white'], s1['title_amber']]:
        w = d.textlength(t, font=fnt(94))
        if 54 + w > W - 50:
            print(f"  [OVERFLOW S1 Title] '{t}': right edge = {54+w:.1f}px (Max: {W-50}px)")
            overflow_count += 1
            
    for parts in s1['teaser']:
        tot_w = sum(d.textlength(txt, font=fnt(74)) + 3 for txt, _ in parts)
        start_x = (W - 52) - tot_w
        if start_x < 50:
            print(f"  [OVERFLOW S1 Teaser] start_x = {start_x:.1f}px (Min: 50px): '{''.join(t for t,_ in parts)}'")
            overflow_count += 1
            
    # Content slides
    for idx, cs in enumerate(item['content_slides'], start=2):
        for h in [cs['head_white'], cs['head_amber']]:
            w = d.textlength(h, font=fnt(80))
            if 62 + w > W - 50:
                print(f"  [OVERFLOW S{idx} Headline] '{h}': right edge = {62+w:.1f}px (Max: {W-50}px)")
                overflow_count += 1
                
        for line_idx, line in enumerate(cs['body']):
            tot_w = sum(d.textlength(txt, font=fnt(45)) + 3 for txt, _ in line)
            if 62 + tot_w > W - 50:
                print(f"  [OVERFLOW S{idx} Body L{line_idx+1}] right edge = {62+tot_w:.1f}px (Max: {W-50}px): '{''.join(t for t,_ in line)}'")
                overflow_count += 1

    # Slide 6
    s6 = item['slide_6']
    rx = 538
    for line_idx, line in enumerate(s6['body']):
        tot_w = sum(d.textlength(txt, font=fnt(39)) + 3 for txt, _ in line)
        if rx + tot_w > W - 40:
            print(f"  [OVERFLOW S6 Body L{line_idx+1}] right edge = {rx+tot_w:.1f}px (Max: {W-40}px): '{''.join(t for t,_ in line)}'")
            overflow_count += 1

print(f"\nTOTAL OVERFLOWS DETECTED: {overflow_count}")
