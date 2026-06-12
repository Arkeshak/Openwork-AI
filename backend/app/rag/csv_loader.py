import csv


def load_csv(path: str):
    try:
        rows = []

        with open(
            path,
            "r",
            encoding="utf-8",
            errors="ignore",
            newline=""
        ) as file:
            reader = csv.reader(file)

            for row in reader:
                rows.append(" | ".join(row))

        return "\n".join(rows)

    except Exception as e:
        print("CSV LOADER ERROR:", str(e))
        return ""
