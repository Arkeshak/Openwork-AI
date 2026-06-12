def load_docx(path: str):
    try:
        from docx import Document

        document = Document(path)

        return "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
            if paragraph.text
        )

    except Exception as e:
        print("DOCX LOADER ERROR:", str(e))
        return ""
