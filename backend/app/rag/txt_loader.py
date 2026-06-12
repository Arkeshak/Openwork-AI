def load_txt(path: str):
    try:
        with open(
            path,
            "r",
            encoding="utf-8",
            errors="ignore"
        ) as file:
            return file.read()

    except Exception as e:
        print("TXT LOADER ERROR:", str(e))
        return ""
