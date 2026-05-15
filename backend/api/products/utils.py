from io import BytesIO

from django.core.files.base import ContentFile
from PIL import Image


def compress_image(image_field, max_width=1200, quality=85):
    """Resize and compress uploaded product images."""
    if not image_field:
        return
    try:
        img = Image.open(image_field)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        if img.width > max_width:
            ratio = max_width / img.width
            new_size = (max_width, int(img.height * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=quality, optimize=True)
        buffer.seek(0)
        name = image_field.name.rsplit('.', 1)[0] + '.jpg'
        image_field.save(name, ContentFile(buffer.read()), save=False)
    except Exception:
        pass
