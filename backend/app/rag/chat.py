import re

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.rag.vector_store import vector_store

llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model=GROQ_MODEL,
    temperature=0,
    max_tokens=1200,
    timeout=30,
    max_retries=2,
)

SYSTEM_PROMPT = """
You are a RAG assistant that gives thorough, detailed answers based strictly on the provided context.

Rules:
- Answer ONLY using the provided context. Do not invent or assume information not present in it.
- Give a COMPLETE and DETAILED answer: cover every relevant point, example, figure, or formula found in the context that relates to the question. Do not summarize down to a few lines if more relevant content is available in the context.
- Structure longer answers with headings or bullet points for readability.
- If a formula, number, or name appears in the context, reproduce it exactly as written — never approximate or guess it.
- If the answer is not in the context, reply exactly:

I couldn't find that information in the uploaded documents.

Always answer in the same language as the user's question.
"""

CONTINUE_INSTRUCTION = (
    "Continue exactly where you left off. Do not repeat any earlier text, "
    "do not restart the sentence or the section, do not say 'continuing' or "
    "similar — just carry on seamlessly as if there had been no interruption."
)

# Sécurité pour éviter une boucle infinie si Groq ne signale jamais la fin
MAX_CONTINUATIONS = 4


def _clean(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def ask_question(question: str, filename: str = None):
    docs = vector_store.similarity_search(question, k=6, filename=filename)

    context = "\n\n".join(
        doc.page_content for doc in docs
    )

    user_prompt = f"""Context:
{context}

Question:
{question}"""

    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ]

    response = llm.invoke(messages)
    full_text = response.content
    finish_reason = response.response_metadata.get("finish_reason")

    continuations = 0
    while finish_reason == "length" and continuations < MAX_CONTINUATIONS:
        messages.append(AIMessage(content=response.content))
        messages.append(HumanMessage(content=CONTINUE_INSTRUCTION))

        response = llm.invoke(messages)
        full_text += response.content
        finish_reason = response.response_metadata.get("finish_reason")
        continuations += 1

    answer = _clean(full_text)

    return {
        "answer": answer,
        "sources": list({
            doc.metadata["doc_id"]
            for doc in docs
            if "doc_id" in doc.metadata
        })
    }