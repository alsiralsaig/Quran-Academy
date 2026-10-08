"""أيقونة التطبيقات: شعار الأكاديمية كامل بالكتابة على خلفية بيضا (زي اختصار الموقع).
- أيقونة متكيّفة (Android 8+) عشان الشعار يملأ الشكل في سامسونج وغيره.
- أيقونة عادية للأجهزة القديمة."""
import os, sys
from PIL import Image, ImageDraw

flavor, outdir, logo_path = sys.argv[1], sys.argv[2], sys.argv[3]
logo = Image.open(logo_path).convert('RGB')
art = logo.crop((227, 146, 1023, 1102))  # حدود الشعار الفعلية
WHITE = (254, 254, 255)

def place(size, frac):
    """الشعار في نص مربع أبيض، أكبر بُعد = frac من الحجم."""
    c = Image.new('RGB', (size, size), WHITE)
    s = frac * size / max(art.size)
    a = art.resize((round(art.width * s), round(art.height * s)), Image.LANCZOS)
    c.paste(a, ((size - a.width) // 2, (size - a.height) // 2))
    return c

def rounded(img, r):
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, img.width - 1, img.height - 1), radius=r, fill=255)
    o = img.convert('RGBA'); o.putalpha(m); return o

dens = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for name, k in dens.items():
    p = os.path.join(outdir, f'mipmap-{name}'); os.makedirs(p, exist_ok=True)
    # المقدمة 108dp؛ الجزء الظاهر حوالي 72dp في النص، فالشعار ياخد ~64% (بيملا الشكل زي الصورة)
    place(round(108 * k), 0.60).save(os.path.join(p, 'ic_fg.png'))
    leg = round(48 * k)
    rounded(place(leg, 0.86), round(leg * 0.22)).save(os.path.join(p, 'ic_launcher.png'))

p = os.path.join(outdir, 'mipmap-anydpi-v26'); os.makedirs(p, exist_ok=True)
xml = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_bg" />
    <foreground android:drawable="@mipmap/ic_fg" />
</adaptive-icon>
'''
open(os.path.join(p, 'ic_launcher.xml'), 'w').write(xml)
os.makedirs(os.path.join(outdir, 'values'), exist_ok=True)
open(os.path.join(outdir, 'values', 'colors.xml'), 'w').write(
    '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_bg">#FEFEFF</color></resources>')

# معاينة: شكل سامسونج (مربع منحني) من الأيقونة المتكيّفة
fg = place(432, 0.60)
v = fg.crop((72, 72, 360, 360))  # الجزء الظاهر 72dp من 108dp
rounded(v, 80).save(os.path.join(outdir, '..', f'icon-{flavor}.png'))
