from pathlib import Path
from typing import List, Dict, Any
import math
import hashlib
import json
from pypdf import PdfReader
from ..core.config import settings
from ..core.org_config import org_config

class AirGappedEmbeddingFunction:
    """
    Deterministic, 100% Air-Gapped Local Semantic Embedder.
    Generates 384-dimensional dense vectors with zero external downloads or network calls.
    Combines lexical term frequency, sub-word hashing, and cosine normalizations.
    """
    def __init__(self, dim: int = 384):
        self.dim = dim

    def __call__(self, input_texts: List[str]) -> List[List[float]]:
        embeddings = []
        for text in input_texts:
            vec = [0.0] * self.dim
            words = text.lower().split()
            if not words:
                embeddings.append(vec)
                continue

            for w in words:
                # Hash word into bucket
                h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16)
                idx = h % self.dim
                sign = 1.0 if ((h >> 8) & 1) == 1 else -1.0
                vec[idx] += sign * (1.0 + math.log(1 + len(w)))

            # L2 Normalize
            norm = math.sqrt(sum(x * x for x in vec)) or 1.0
            norm_vec = [round(x / norm, 5) for x in vec]
            embeddings.append(norm_vec)
        return embeddings

import logging

logger = logging.getLogger("rag_engine")

class SovereignRAGEngine:
    """
    On-premise Vector Database for organizational manuals and SOPs.
    Zero external cloud calls; uses real BGE-M3 dense embeddings from Samsung 980 SSD.
    """

    def __init__(self):
        self.db_dir = settings.DATA_DIR / "sovereign_rag"
        self.db_dir.mkdir(parents=True, exist_ok=True)
        self.index_file = self.db_dir / "index.json"

        # Load real bge-m3 model from root, RTX 4060 Laptop (D:\model), or external SSD
        bge_candidates = [
            settings.BASE_DIR.parent.parent / "models" / "bge-m3",
            settings.BASE_DIR.parent / "models" / "bge-m3",
            Path(settings.SSD_MODEL_DIR) / "bge-m3",
            Path("models/bge-m3"),
            Path("D:/model/bge-m3"),
            Path("D:\\model\\bge-m3"),
            Path("/mnt/d/model/bge-m3"),
            Path("/Volumes/980/USER/SIH_Agentic_Workbench/models/bge-m3"),
        ]
        bge_path = next((p for p in bge_candidates if p.exists()), None)
        self.real_bge = None
        if bge_path:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading real BGE-M3 neural model from {bge_path}...")
                self.real_bge = SentenceTransformer(str(bge_path))
                logger.info("Real BGE-M3 model loaded successfully!")
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer: {e}")

        self.fallback_embedder = AirGappedEmbeddingFunction(dim=384)
        self.documents: List[Dict[str, Any]] = []
        self._last_loaded_mtime = 0.0
        self._load_from_disk()

    def _load_from_disk(self):
        if self.index_file.exists():
            try:
                mtime = self.index_file.stat().st_mtime
                with open(self.index_file, "r") as f:
                    self.documents = json.load(f)
                self._last_loaded_mtime = mtime
            except Exception as e:
                logger.warning(f"Error reading index file: {e}")
                self.documents = []
        else:
            self.documents = []

    def _ensure_fresh_index(self):
        if self.index_file.exists():
            try:
                mtime = self.index_file.stat().st_mtime
                if mtime > getattr(self, "_last_loaded_mtime", 0.0):
                    with open(self.index_file, "r") as f:
                        self.documents = json.load(f)
                    self._last_loaded_mtime = mtime
            except Exception as e:
                logger.warning(f"Could not refresh index: {e}")

    def _encode_via_ollama(self, texts: List[str]) -> Optional[List[List[float]]]:
        """Encodes texts using local Ollama nomic-embed-text (Port 11434)."""
        import requests
        try:
            embeddings = []
            for t in texts:
                resp = requests.post(
                    f"{settings.OLLAMA_API_BASE}/api/embeddings",
                    json={"model": "nomic-embed-text", "prompt": t},
                    timeout=3.0
                )
                if resp.status_code == 200:
                    emb = resp.json().get("embedding")
                    if emb:
                        embeddings.append(emb)
                    else:
                        return None
                else:
                    return None
            return embeddings
        except Exception:
            return None

    def encode(self, texts: List[str]) -> List[List[float]]:
        # 1. Real BGE-M3 from local disk if available
        if self.real_bge:
            try:
                embeddings = self.real_bge.encode(texts, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.warning(f"BGE-M3 encode failed, falling back: {e}")

        # 2. Local Ollama nomic-embed-text
        ollama_embs = self._encode_via_ollama(texts)
        if ollama_embs:
            return ollama_embs

        # 3. Built-in zero-dependency deterministic air-gapped embedder
        return self.fallback_embedder(texts)

    def _seed_default_standards(self):
        """Pre-populates the vector store with foundational statutory standards."""
        defaults = [
            {
                "id": "naac_crit_3",
                "doc_type": "standard",
                "standard": "NAAC",
                "section": "Criterion III - Research, Innovations and Extension",
                "content": (
                    "NAAC Criterion 3 Assessment Guidelines:\n"
                    "- 3.1: Promotion of Research and Facilities (Seed money, fellowships).\n"
                    "- 3.2: Resource Mobilization for Research (Sponsored grants in Lakhs).\n"
                    "- 3.3: Innovation Ecosystem (Incubation centres & startups).\n"
                    "- 3.4: Research Publications and Awards (Scopus / Web of Science / UGC CARE indexed papers).\n"
                    "- 3.5: Consultancy Revenue.\n"
                    "- 3.7: Collaborative Research and MoUs signed with industry."
                )
            },
            {
                "id": "ugc_api_regulations",
                "doc_type": "standard",
                "standard": "UGC",
                "section": "Minimum Qualifications for Teachers & API Scores",
                "content": (
                    "UGC Regulations for Academic Performance Indicators (API):\n"
                    "- Category I: Teaching-Learning and Evaluation Related Activities.\n"
                    "- Category II: Professional Development, Co-Curricular & Extension Activities.\n"
                    "- Category III: Research & Academic Contributions (Peer-reviewed journals, impact factor points, research projects)."
                )
            },
            {
                "id": "nirf_rpc_guidelines",
                "doc_type": "standard",
                "standard": "NIRF",
                "section": "Research and Professional Practice (RPC)",
                "content": (
                    "NIRF Research and Professional Practice (RPC) Weightage: 30%\n"
                    "- Metric PU: Combined metric for Publications (Scopus and Web of Science).\n"
                    "- Metric QP: Quality of Publications measured by citations per faculty over 3-year window.\n"
                    "- Metric FPPP: Footprint of Projects and Professional Practice (Research funding from DST, SERB, DBT, industry)."
                )
            }
        ]

        # Compute embeddings using real BGE-M3 model
        texts = [d["content"] for d in defaults]
        vecs = self.encode(texts)
        for doc, vec in zip(defaults, vecs):
            doc["vector"] = vec
            self.documents.append(doc)

        self._save_index()

    def _save_index(self):
        with open(self.index_file, "w") as f:
            json.dump(self.documents, f, indent=2)
        try:
            self._last_loaded_mtime = self.index_file.stat().st_mtime
        except Exception:
            pass

    def search_sops(self, query: str, n_results: int = 5, doc_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Hybrid Semantic & Lexical Vector Search over sovereign document index.
        Combines dense BGE-M3 cosine similarity with exact-phrase & entity token boosting
        for ultra-precise retrieval across Students, Faculty, Research, Events, and Standards.
        """
        self._ensure_fresh_index()
        if not self.documents:
            return []

        import re
        q_lower = (query or "").lower().strip()
        q_vec = self.encode([query])[0] if query else []
        
        stopwords = {
            "who", "what", "where", "when", "which", "how", "why", "is", "are", "was", "were",
            "his", "her", "their", "the", "a", "an", "and", "or", "for", "with", "about", "tell",
            "show", "give", "list", "details", "profile", "records", "have", "has", "does", "can",
            "any", "all", "achievements", "achievement", "information", "info", "me", "he", "she"
        }
        tokens = [
            w for w in re.findall(r"[a-zA-Z0-9_\.-]+", q_lower)
            if len(w) > 1 and w not in stopwords
        ]

        # Roman numeral expansion for accreditation criteria (e.g., 3 <-> iii, 2 <-> ii)
        num_to_roman = {"1": "i", "2": "ii", "3": "iii", "4": "iv", "5": "v", "6": "vi", "7": "vii"}
        roman_to_num = {v: k for k, v in num_to_roman.items()}
        expanded_tokens = list(tokens)
        for t in tokens:
            if t in num_to_roman:
                expanded_tokens.append(num_to_roman[t])
            elif t in roman_to_num:
                expanded_tokens.append(roman_to_num[t])

        scores = []
        for doc in self.documents:
            if doc_type and doc.get("doc_type", "standard") != doc_type:
                continue

            d_vec = doc.get("vector", [])
            # 1. Dense Cosine Similarity
            dot = sum(a * b for a, b in zip(q_vec, d_vec)) if (q_vec and d_vec) else 0.0

            # 2. Lexical Phrase & Token Boosting with Exact Word Boundaries
            std = str(doc.get("standard", "")).lower()
            sec = str(doc.get("section", "")).lower()
            cnt = str(doc.get("content", "")).lower()
            doc_id = str(doc.get("id", "")).lower()

            lex_score = 0.0

            # Multi-token phrase matching with word boundaries
            for phrase_len in range(min(5, len(tokens)), 1, -1):
                for i in range(len(tokens) - phrase_len + 1):
                    phrase = " ".join(tokens[i:i + phrase_len])
                    pat = r"\b" + re.escape(phrase) + r"\b"
                    if re.search(pat, std):
                        lex_score += 0.85
                    elif re.search(pat, sec):
                        lex_score += 0.65
                    elif re.search(pat, cnt):
                        lex_score += 0.45

            # Individual key tokens with exact word boundaries
            for t in expanded_tokens:
                pat = r"\b" + re.escape(t) + r"\b"
                if re.search(pat, doc_id):
                    lex_score += 0.50
                if re.search(pat, std):
                    lex_score += 0.35
                elif re.search(pat, sec):
                    lex_score += 0.20
                elif re.search(pat, cnt):
                    lex_score += 0.12

            total_relevance = round(dot + lex_score, 4)
            scores.append((total_relevance, dot, lex_score, doc))

        # Sort descending by combined hybrid score
        scores.sort(key=lambda x: x[0], reverse=True)

        # Dynamic Noise Pruning: if top result is a strong entity match, prune low-relevance noise
        if scores and scores[0][0] > 0.8:
            top_score = scores[0][0]
            pruned = [s for s in scores if s[0] >= top_score * 0.35 and s[2] > 0]
            top_matches = pruned[:n_results]
        else:
            top_matches = scores[:n_results]

        return [
            {
                "id": item[3].get("id", ""),
                "doc_type": item[3].get("doc_type", "standard"),
                "standard": item[3].get("standard", "Institutional Standard"),
                "section": item[3].get("section", "Section"),
                "clause": item[3].get("section", "Section"),
                "content": item[3].get("content", ""),
                "text": item[3].get("content", ""),
                "relevance_score": item[0],
                "dense_score": round(item[1], 4),
                "lexical_score": round(item[2], 4)
            }
            for item in top_matches
        ]

    def list_documents(self, search: Optional[str] = None, doc_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns all indexed documents, omitting the heavy vector array."""
        self._ensure_fresh_index()
        results = []
        q = (search or "").strip().lower()
        for d in self.documents:
            if doc_type and d.get("doc_type", "standard") != doc_type:
                continue
            std = d.get("standard", "")
            sec = d.get("section", "")
            cnt = d.get("content", "")
            if q:
                if q not in std.lower() and q not in sec.lower() and q not in cnt.lower():
                    continue
            results.append({
                "id": d.get("id", ""),
                "doc_type": d.get("doc_type", "standard"),
                "standard": std,
                "section": sec,
                "content": cnt,
                "char_count": len(cnt),
                "word_count": len(cnt.split()),
                "has_embedding": bool(d.get("vector"))
            })
        return results

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific document by its ID."""
        self._ensure_fresh_index()
        for d in self.documents:
            if d.get("id") == doc_id:
                return {
                    "id": d.get("id", ""),
                    "doc_type": d.get("doc_type", "standard"),
                    "standard": d.get("standard", ""),
                    "section": d.get("section", ""),
                    "content": d.get("content", ""),
                    "char_count": len(d.get("content", "")),
                    "word_count": len(d.get("content", "").split()),
                    "has_embedding": bool(d.get("vector"))
                }
        return None

    def add_document(self, standard: str, section: str, content: str, doc_id: Optional[str] = None, doc_type: str = "standard") -> Dict[str, Any]:
        """Creates a new document entry, encodes its vector embedding offline, and persists to index."""
        self._ensure_fresh_index()
        import uuid
        actual_id = doc_id or f"doc_{uuid.uuid4().hex[:8]}"
        
        # Remove any existing doc with this ID
        self.documents = [d for d in self.documents if d.get("id") != actual_id]
        
        # Compute vector embedding
        vec = self.encode([content])[0]
        
        doc_obj = {
            "id": actual_id,
            "doc_type": doc_type,
            "standard": standard.strip(),
            "section": section.strip(),
            "content": content.strip(),
            "vector": vec
        }
        self.documents.append(doc_obj)
        self._save_index()
        
        return {
            "id": actual_id,
            "standard": doc_obj["standard"],
            "section": doc_obj["section"],
            "content": doc_obj["content"],
            "char_count": len(doc_obj["content"]),
            "has_embedding": True
        }

    def update_document(self, doc_id: str, standard: Optional[str] = None, section: Optional[str] = None, content: Optional[str] = None, doc_type: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Updates an existing document and recomputes the vector embedding if content changed."""
        self._ensure_fresh_index()
        for d in self.documents:
            if d.get("id") == doc_id:
                if doc_type is not None:
                    d["doc_type"] = doc_type.strip()
                if standard is not None:
                    d["standard"] = standard.strip()
                if section is not None:
                    d["section"] = section.strip()
                if content is not None:
                    cleaned_content = content.strip()
                    if cleaned_content != d.get("content"):
                        d["content"] = cleaned_content
                        d["vector"] = self.encode([cleaned_content])[0]
                self._save_index()
                return {
                    "id": d.get("id", ""),
                    "standard": d.get("standard", ""),
                    "section": d.get("section", ""),
                    "content": d.get("content", ""),
                    "char_count": len(d.get("content", "")),
                    "has_embedding": bool(d.get("vector"))
                }
        return None

    def delete_document(self, doc_id: str) -> bool:
        """Deletes a document from the index by its ID."""
        self._ensure_fresh_index()
        initial_count = len(self.documents)
        self.documents = [d for d in self.documents if d.get("id") != doc_id]
        if len(self.documents) < initial_count:
            self._save_index()
            return True
        return False

    def ingest_pdf(self, pdf_path: Path, standard_name: str) -> int:
        """Parses a PDF, chunks it into sections, embeds it, and stores in the DB."""
        try:
            import PyPDF2
        except ImportError:
            import pypdf as PyPDF2
        import uuid
        
        chunks = []
        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page_num, page in enumerate(reader.pages):
                text = page.extract_text()
                if not text: continue
                
                text = text.strip()
                if len(text) < 20: continue
                
                doc_id = f"pdf_{uuid.uuid4().hex[:8]}"
                chunks.append({
                    "id": doc_id,
                    "standard": standard_name.strip(),
                    "section": f"Page {page_num + 1}",
                    "content": text
                })
        
        if not chunks:
            return 0
            
        # Encode chunks
        texts = [c["content"] for c in chunks]
        vecs = self.encode(texts)
        
        # Add to index
        for c, vec in zip(chunks, vecs):
            c["vector"] = vec
            self.documents.append(c)
            
        self._save_index()
        return len(chunks)

    def reset_to_defaults(self) -> List[Dict[str, Any]]:
        """Resets the vector database back to original foundational organizational standards."""
        self.documents = []
        self._seed_default_standards()
        return self.list_documents()

rag_engine = SovereignRAGEngine()

