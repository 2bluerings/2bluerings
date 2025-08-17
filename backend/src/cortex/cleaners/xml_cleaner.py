import re
from bs4 import BeautifulSoup

class XmlCleaner:
    def __call__(self, content: str) -> str:
        """Cleans HTML/XML content into plain readable text."""
        soup = BeautifulSoup(content, "lxml")
        for tag in soup.find_all(
            ['ac:structured-macro', 'ac:parameter', 'ri:user', 'ac:link', 'ac:image']
        ):
            tag.decompose()

        text = soup.get_text(separator="\n")

        text = re.sub(r'\xa0', ' ', text)
        text = re.sub(r'[ \t]+', ' ', text)

        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'\n +', '\n', text)

        return text.strip()
