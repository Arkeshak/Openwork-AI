from pathlib import Path

from app.rag.csv_loader import load_csv
from app.rag.docx_loader import load_docx
from app.rag.pdf_loader import load_pdf
from app.rag.txt_loader import load_txt


def load_document(path: str):
    suffix = Path(path).suffix.lower()

    if suffix == ".pdf":
        return load_pdf(path)

    if suffix == ".docx":
        return load_docx(path)

    if suffix in {".txt", ".md"}:
        return load_txt(path)

    if suffix == ".csv":
        return load_csv(path)

    return ""
