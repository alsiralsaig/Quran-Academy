"""أيقونات التطبيقات التلاتة: شعار الأكاديمية + إطار ولون خاص بكل تطبيق."""
import sys
from PIL import Image, ImageDraw

flavor, outdir = sys.argv[1], sys.argv[2]
COLORS = {'admin': (180, 83, 9), 'teacher': (15, 118, 110), 'student': (37, 99, 235)}
c = COLORS[flavor]
logo = Image.open(sys.argv[3]).convert('RGB').crop((315, 125, 945, 885))  # الرمز بدون الكتابة

S = 1024
icon = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(icon)
d.rounded_rectangle((0, 0, S - 1, S - 1), radius=230, fill=c)
d.rounded_rectangle((70, 70, S - 71, S - 71), radius=170, fill=(255, 255, 255))
em = logo.resize((700, int(700 * logo.height / logo.width)), Image.LANCZOS)
icon.paste(em, ((S - em.width) // 2, (S - em.height) // 2 + 10))
# شريط سفلي بلون التطبيق
d.rounded_rectangle((330, 880, S - 330, 930), radius=25, fill=c)

import os
for name, px in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    p = os.path.join(outdir, f'mipmap-{name}')
    os.makedirs(p, exist_ok=True)
    icon.resize((px, px), Image.LANCZOS).save(os.path.join(p, 'ic_launcher.png'))
icon.resize((512, 512), Image.LANCZOS).save(os.path.join(outdir, '..', f'icon-{flavor}.png'))
