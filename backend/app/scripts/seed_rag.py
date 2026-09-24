import os
import sys
from pathlib import Path
from pypdf import PdfReader

# Add backend dir to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.tools.rag_engine import rag_engine

def seed_from_pdf(pdf_path: str):
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found.")
        return
    
    print(f"Reading {pdf_path}...")
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
        
    print(f"Extracted {len(text)} characters. Chunking...")
    
    # Simple chunking by paragraph
    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""
    for p in paragraphs:
        if len(current_chunk) + len(p) < 1000:
            current_chunk += p + "\n\n"
        else:
            if current_chunk.strip():
                chunks.append(current_chunk.strip())
            current_chunk = p + "\n\n"
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
        
    print(f"Created {len(chunks)} chunks. Indexing into SovereignRAGEngine...")
    
    # We'll clear the default items from Amity and seed properly
    rag_engine.documents = []
    
    for i, chunk in enumerate(chunks):
        doc_id = f"amity_scraped_{i}"
        rag_engine.add_document(
            standard="Amity University Lucknow Knowledge Base",
            section=f"Section {i+1}",
            content=chunk,
            doc_id=doc_id
        )
        print(f"Indexed chunk {i+1}/{len(chunks)}")
        
    print(f"Successfully seeded RAG Engine with {len(chunks)} documents from {pdf_path}")

if __name__ == "__main__":
    default_pdf = Path(__file__).parent.parent / "data" / "sops" / "Amity_University_Lucknow_Knowledge_Base.pdf"
    pdf_path = str(default_pdf) if default_pdf.exists() else "Amity_University_Lucknow_Knowledge_Base.pdf"
    seed_from_pdf(pdf_path)
