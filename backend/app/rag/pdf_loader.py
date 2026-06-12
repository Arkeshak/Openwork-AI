from pypdf import PdfReader


def load_pdf(path: str):
    try:
        reader = PdfReader(path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text

    except Exception as e:
        print("PDF LOADER ERROR:", str(e))
        return ""
