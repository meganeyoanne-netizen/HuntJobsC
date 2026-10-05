from io import BytesIO
from zipfile import ZipFile, BadZipFile
from xml.etree import ElementTree
from rest_framework.exceptions import ValidationError

def extract_text(uploaded):
    if uploaded.size > 10 * 1024 * 1024:
        raise ValidationError("Document limité à 10 Mo.")
    extension = uploaded.name.rsplit(".", 1)[-1].lower()
    try:
        if extension == "pdf":
            from pypdf import PdfReader
            text = "\n".join(page.extract_text() or "" for page in PdfReader(uploaded).pages)
        elif extension == "txt":
            text = uploaded.read().decode("utf-8-sig")
        elif extension == "docx":
            with ZipFile(BytesIO(uploaded.read())) as archive:
                info = archive.getinfo("word/document.xml")
                if info.file_size > 5 * 1024 * 1024:
                    raise ValidationError("Document trop volumineux.")
                root = ElementTree.fromstring(archive.read(info))
                text = " ".join(root.itertext())
        elif extension == "doc":
            from legacy_doc import extract_text as extract_legacy_doc
            text = extract_legacy_doc(uploaded.read()).text
        else:
            raise ValidationError("Formats acceptés : PDF contenant du texte, DOC, DOCX, TXT.")
    except ValidationError:
        raise
    except Exception as exc:
        raise ValidationError("Le document ne peut pas être lu. Vérifiez qu'il n'est ni chiffré ni endommagé.") from exc
    if not text.strip():
        raise ValidationError("Le document ne contient aucun texte exploitable.")
    return text[:30000]


def image_data_url(uploaded):
    import base64
    from PIL import Image
    if uploaded.size > 4*1024*1024:
        raise ValidationError("Image limitée à 4 Mo.")
    content=uploaded.read()
    try:
        image=Image.open(BytesIO(content))
        mime={"PNG":"image/png","JPEG":"image/jpeg","WEBP":"image/webp"}.get(image.format)
        image.verify()
        if not mime:
            raise ValueError()
    except Exception as exc:
        raise ValidationError("Image PNG, JPEG ou WebP invalide.") from exc
    return "data:"+mime+";base64,"+base64.b64encode(content).decode("ascii")
