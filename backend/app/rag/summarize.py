import re

from app.rag.chat import llm
from app.rag.vector_store import vector_store

SUMMARY_PROMPT = """
You are a document summarization assistant.

Summarize the following document content in a clear, structured way:
- Start with a 2-3 sentence overview.
- Follow with 3-6 bullet points covering the key ideas, facts, or sections.

Only use the content provided below. Do not invent information.

Answer in the same language as the document content.

Document content:
{content}
"""

# Limite de sécurité pour rester sous le plafond Groq (6000 tokens/minute
# sur le tier gratuit). Si le document dépasse cette taille, le contenu
# est tronqué : le résumé ne couvrira alors que le début du document.
MAX_CHARS = 6000


def summarize_document(filename: str):
    chunks = vector_store.get_document_chunks(filename)

    if not chunks:
        return {
            "summary": "Aucun contenu trouvé pour ce document. Vérifie qu'il a bien été indexé.",
            "insights": [],
        }

    content = "\n\n".join(chunks)[:MAX_CHARS]

    prompt = SUMMARY_PROMPT.format(content=content)

    response = llm.invoke(prompt)

    text = re.sub(
        r"<think>.*?</think>",
        "",
        response.content,
        flags=re.DOTALL,
    ).strip()

    lines = [line.strip() for line in text.split("\n") if line.strip()]
    bullets = [
        re.sub(r"^[-*•]\s*", "", line)
        for line in lines
        if line.startswith(("-", "*", "•"))
    ]
    overview_lines = [
        line for line in lines
        if not line.startswith(("-", "*", "•"))
    ]

    return {
        "summary": " ".join(overview_lines) if overview_lines else text,
        "insights": bullets,
    }