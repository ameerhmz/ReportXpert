from pathlib import Path
from typing import List, Dict, Any
from .office_styler import build_executive_deck

def create_executive_presentation(
    output_path: Path,
    title: str,
    subtitle: str,
    slides_data: list,
    framework: str = "NAAC / UGC"
) -> str:
    """
    Generates an Executive Board Presentation in PowerPoint (.pptx)
    with 16:9 widescreen, midnight gradient title slide, and clean card containers.
    """
    return build_executive_deck(
        output_path=output_path,
        title=title,
        subtitle=subtitle,
        slides_data=slides_data,
        framework=framework
    )
