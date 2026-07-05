from langchain_community.document_loaders import PyPDFLoader


def load_pdf(pdf_path: str):
    loader = PyPDFLoader(pdf_path)

    documents = loader.load()

    for doc in documents:
        doc.metadata["source"] = pdf_path

    return documents