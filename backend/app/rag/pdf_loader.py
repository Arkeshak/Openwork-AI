import re


def _fix_spaced_text(text: str) -> str:
    """
    Fix PDFs that encode text as 'A R K E S H K A R' (single chars separated by spaces).
    Detects lines/blocks where most tokens are single characters and collapses them.
    """
    lines = text.split("\n")
    fixed_lines = []
    for line in lines:
        tokens = line.split(" ")
        if len(tokens) > 3:
            single_char = sum(1 for t in tokens if len(t) == 1)
            ratio = single_char / len(tokens)
            if ratio > 0.6:
                # Collapse: rejoin without spaces, then split on double-space groups
                collapsed = "".join(tokens)
                # Try to re-split on double-spaces that mark word boundaries
                collapsed = re.sub(r"  +", " ", line.replace("  ", "\x00"))
                collapsed = collapsed.replace(" ", "").replace("\x00", " ")
                fixed_lines.append(collapsed.strip())
                continue
        fixed_lines.append(line)
    return "\n".join(fixed_lines)


def load_pdf(path: str) -> str:
    # Try pdfplumber first — much better at real-world PDFs
    try:
        import pdfplumber
        text_parts = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        text = "\n".join(text_parts).strip()
        if text:
            print(f"PDF LOADER (pdfplumber): extracted {len(text)} chars")
            return text
    except Exception as e:
        print(f"PDF LOADER pdfplumber error: {e}, falling back to pypdf")

    # Fallback: pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        text = text.strip()
        if text:
            # Fix spaced-character encoding artifact
            text = _fix_spaced_text(text)
            print(f"PDF LOADER (pypdf fallback): extracted {len(text)} chars")
        return text
    except Exception as e:
        print(f"PDF LOADER ERROR: {e}")
        return ""
