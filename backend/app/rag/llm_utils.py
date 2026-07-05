import re
import time

from groq import APIStatusError
from langchain_core.messages import HumanMessage, AIMessage

CONTINUE_INSTRUCTION = (
    "Continue exactly where you left off. Do not repeat any earlier text, "
    "do not restart the sentence or the section, do not say 'continuing' or "
    "similar — just carry on seamlessly as if there had been no interruption."
)

# Sécurité pour éviter une boucle infinie si le modèle ne signale jamais la fin
MAX_CONTINUATIONS = 4

# Backoff appliqué UNIQUEMENT quand Groq répond qu'on a atteint la limite
# de tokens/minute (429/413) — pas de pause systématique sinon.
RATE_LIMIT_BACKOFF_SECONDS = 20
MAX_RATE_LIMIT_RETRIES = 3


def clean_response(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


def _safe_invoke(llm, messages, label):
    """Appelle le modèle normalement, sans aucune pause. Si Groq répond
    qu'on a dépassé la limite de tokens/minute (429 ou 413), attend
    puis réessaie — au lieu d'attendre systématiquement à chaque appel."""
    retries = 0
    while True:
        try:
            return llm.invoke(messages)
        except APIStatusError as e:
            status = getattr(e, "status_code", None)
            if status in (429, 413) and retries < MAX_RATE_LIMIT_RETRIES:
                retries += 1
                wait = RATE_LIMIT_BACKOFF_SECONDS * retries
                print(f"[{label}] limite Groq atteinte (code {status}), pause de {wait}s puis réessai ({retries}/{MAX_RATE_LIMIT_RETRIES})...")
                time.sleep(wait)
                continue
            raise


def invoke_with_continuation(llm, messages, label="llm"):
    """Appelle le modèle, et si sa réponse est coupée par max_tokens
    (finish_reason == 'length'), relance automatiquement en demandant
    de continuer exactement là où il s'est arrêté, jusqu'à obtenir une
    réponse complète (ou MAX_CONTINUATIONS atteint, par sécurité)."""
    messages = list(messages)

    response = _safe_invoke(llm, messages, label)
    full_text = response.content
    finish_reason = response.response_metadata.get("finish_reason")
    print(f"[{label}] réponse initiale reçue (finish_reason={finish_reason})")

    continuations = 0
    while finish_reason == "length" and continuations < MAX_CONTINUATIONS:
        print(f"[{label}] réponse coupée, continuation {continuations + 1}/{MAX_CONTINUATIONS}...")
        messages.append(AIMessage(content=response.content))
        messages.append(HumanMessage(content=CONTINUE_INSTRUCTION))

        response = _safe_invoke(llm, messages, label)
        full_text += response.content
        finish_reason = response.response_metadata.get("finish_reason")
        continuations += 1
        print(f"[{label}] continuation {continuations} reçue (finish_reason={finish_reason})")

    return clean_response(full_text)