import json
import random

from langchain_core.messages import HumanMessage
from langchain_groq import ChatGroq

from app.config import GROQ_API_KEY, GROQ_MODEL
from app.rag.vector_store import vector_store
from app.rag.llm_utils import invoke_with_continuation


llm = ChatGroq(
    groq_api_key=GROQ_API_KEY,
    model_name=GROQ_MODEL,
    temperature=0.3,
    max_tokens=1500,
    timeout=30,
    max_retries=2,
)


PROMPT = """
Tu es un professeur universitaire.

Lis attentivement le contexte.

Crée EXACTEMENT 3 questions.

Les questions doivent porter sur des parties différentes du texte.

Utilise plusieurs types :

- mcq
- true_false
- short

Pour les QCM :

- exactement 4 propositions

- une seule correcte

- mélange l'ordre des réponses

Pour les questions true_false, la valeur de "answer" doit être exactement
la chaîne "vrai" ou "faux" (en minuscules, sans autre mot).

Les questions doivent être progressives :

1 facile

1 moyenne

1 difficile

Les réponses doivent être précises.

Ajoute toujours une explication pédagogique.

Retourne uniquement du JSON, sans aucun texte avant ou après, sans balises de code.

{{
    "questions":[
        {{
            "type":"mcq",
            "question":"",
            "choices":[
                "",
                "",
                "",
                ""
            ],
            "answer":"",
            "explanation":""
        }}
    ]
}}

Contexte :

{context}
"""


def _extract_json(content: str) -> str:
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1] if content.count("```") >= 2 else content.replace("```", "")
        content = content.removeprefix("json").strip()
    # Sécurité supplémentaire : ne garder que la portion entre la première
    # et la dernière accolade, au cas où le modèle ajoute du texte autour.
    start = content.find("{")
    end = content.rfind("}")
    if start != -1 and end != -1:
        content = content[start:end + 1]
    return content


def ask_llm(context, label="quiz"):
    messages = [HumanMessage(content=PROMPT.format(context=context))]

    raw = invoke_with_continuation(llm, messages, label=label)
    cleaned = _extract_json(raw)

    return json.loads(cleaned)


def generate_quiz(filename):

    chunks = vector_store.get_representative_chunks(
        filename,
        k=40
    )

    if not chunks:

        return {
            "title": "Quiz",
            "questions": []
        }

    questions = []

    # --------- paramètres ---------

    CHUNK_PER_REQUEST = 10

    MAX_CONTEXT = 6000

    # ------------------------------

    batches = list(range(0, len(chunks), CHUNK_PER_REQUEST))

    for batch_num, i in enumerate(batches):

        batch = chunks[i:i + CHUNK_PER_REQUEST]

        context = ""

        for chunk in batch:

            if len(context) + len(chunk) > MAX_CONTEXT:
                break

            context += chunk + "\n\n"

        if not context:
            continue

        try:
            print(f"[quiz] lot {batch_num + 1}/{len(batches)}...")
            result = ask_llm(context, label=f"quiz-{batch_num + 1}")
            new_questions = result.get("questions", [])
            print(f"[quiz] lot {batch_num + 1}/{len(batches)} : {len(new_questions)} question(s) générée(s)")
            questions.extend(new_questions)

        except json.JSONDecodeError as e:
            print(f"[quiz] lot {batch_num + 1} : JSON invalide reçu du modèle ({e})")
        except Exception as e:
            print(f"[quiz] lot {batch_num + 1} : erreur ({type(e).__name__}: {e})")

    # Supprimer les doublons

    unique = []

    seen = set()

    for q in questions:

        key = q.get("question", "").lower()

        if key and key not in seen:

            seen.add(key)

            unique.append(q)

    random.shuffle(unique)

    print(f"[quiz] terminé : {len(unique)} question(s) unique(s) au total")

    return {

        "title": f"Quiz - {filename}",

        "questions": unique[:10]

    }