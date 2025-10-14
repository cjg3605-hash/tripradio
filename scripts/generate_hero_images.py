#!/usr/bin/env python3
"""
Hero 섹션용 컬러 이미지를 Google 이미지 생성 모델(나노바나나)로 재생성하는 스크립트입니다.

사전 준비:
  pip install google-generativeai google-genai pillow
환경 변수:
  GEMINI_API_KEY 또는 GOOGLE_API_KEY 중 하나가 필요합니다.
실행:
  python3 scripts/generate_hero_images.py
"""

import base64
import binascii
import io
import os
from pathlib import Path
from typing import Optional, Tuple

import google.generativeai as legacy_genai
import google.genai as genai
from google.genai import types as genai_types
from PIL import Image

# 출력 디렉터리 설정
ROOT_DIR = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT_DIR / "public" / "images" / "landmarks"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def load_env_file(paths: list[Path]) -> None:
    for env_path in paths:
        if not env_path.exists():
            continue
        for line in env_path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip()

            if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
                value = value[1:-1]

            if key not in os.environ or os.environ.get(key, "") == "":
                os.environ[key] = value

load_env_file([ROOT_DIR / ".env.local", ROOT_DIR / ".env"])

# 사용할 모델 (공식 Imagen 3 모델명 사용)
IMAGE_MODEL_NAME = os.getenv("NANOBANANA_MODEL", "imagen-3.0-generate-002")
TEXT_MODEL_NAME = os.getenv("GEMINI_TEXT_MODEL", "models/gemini-1.5-flash-latest")
IMAGE_EDIT_MODEL_NAME = os.getenv("GEMINI_EDIT_MODEL", "imagen-3.0-generate-002")
ENABLE_IMAGE_GENERATION = os.getenv("ENABLE_IMAGE_GENERATION", "true").lower() not in {"0", "false", "no"}
ENABLE_IMAGE_EDIT = os.getenv("ENABLE_IMAGE_EDIT", "").lower() in {"1", "true", "yes"}

# 히어로 섹션에서 사용하는 각 랜드마크별 프롬프트
LANDMARK_PROMPTS = {
    "eiffel-tower": {
        "concept": "Eiffel Tower at golden hour with park visitors and lush greenery",
        "prompt": (
            "Ultra high-resolution, vibrant color photograph of the Eiffel Tower at golden hour. "
            "Warm sunlight, glowing sky, tourists enjoying the park, lush green trees, full-color aesthetic."
        ),
        "edit_instruction": (
            "Transform this image into a vibrant golden-hour scene around the Eiffel Tower with glowing sky and "
            "warm lighting on the iron lattice. Enhance tree foliage to deep greens and add joyful tourists in the park."
        ),
        "negative_prompt": "black and white, monochrome, dull colors, low detail, blurry, illustration",
    },
    "colosseum": {
        "concept": "Colosseum in Rome at sunset with warm light and street ambience",
        "prompt": (
            "Photorealistic landscape photograph of the Colosseum in Rome at sunset, warm orange light, "
            "detailed stone textures, dramatic sky, lively street scene with people walking, vivid colors."
        ),
        "edit_instruction": (
            "Recolor this Colosseum photo with rich golden sunset lighting, dramatic clouds, and lively street ambience. "
            "Highlight ancient stone textures and keep the scene photorealistic."
        ),
        "negative_prompt": "black and white, sketch, faded colors, low detail, empty streets, foggy",
    },
    "taj-mahal": {
        "concept": "Taj Mahal sunrise reflection with visitors and gardens",
        "prompt": (
            "Photorealistic image of the Taj Mahal at sunrise, soft golden and pink hues, pristine white marble "
            "reflecting in the water, visitors strolling, lush gardens, rich color palette."
        ),
        "edit_instruction": (
            "Infuse sunrise colors into this Taj Mahal image with pink-gold sky and reflective pools. "
            "Accentuate marble luminosity, lush gardens, and gentle morning atmosphere."
        ),
        "negative_prompt": "monochrome, desaturated, night scene, unrealistic lighting, painting",
    },
    "statue-of-liberty": {
        "concept": "Statue of Liberty midday scene with Manhattan skyline",
        "prompt": (
            "Full-color, high-resolution photograph of the Statue of Liberty on a bright day, clear blue sky, "
            "New York skyline in the background, seawater reflections, lively atmosphere."
        ),
        "edit_instruction": (
            "Convert this Statue of Liberty shot into a bright midday scene with saturated blues, crisp skyline detail, "
            "and sparkling harbor reflections. Maintain stately realism."
        ),
        "negative_prompt": "black and white, clouds covering statue, foggy, muted colors, illustration",
    },
    "gyeongbokgung": {
        "concept": "Gyeongbokgung Palace autumn colors with visitors in hanbok",
        "prompt": (
            "Richly colored photograph of Gyeongbokgung Palace in Seoul during autumn, vibrant foliage, "
            "traditional architecture under warm sunlight, visitors wearing hanbok, dramatic sky."
        ),
        "edit_instruction": (
            "Reimagine this palace image with vivid autumn foliage, warm sunlight on traditional architecture, "
            "and visitors in colorful hanbok. Keep the details sharp and photorealistic."
        ),
        "negative_prompt": "monochrome, winter, overcast, empty courtyard, low contrast",
    },
    "machu-picchu": {
        "concept": "Machu Picchu daylight view with green terraces and mist",
        "prompt": (
            "Ultra-detailed color photograph of Machu Picchu under clear daylight, lush green terraces, "
            "mountain backdrop, thin morning clouds, tourists exploring, vivid textures."
        ),
        "edit_instruction": (
            "Enhance this Machu Picchu scene with bright daylight, lush green terraces, soft mist hugging the peaks, "
            "and explorers on the paths. Preserve the cinematic realism."
        ),
        "negative_prompt": "black and white, rainy, foggy, low-resolution, dull colors",
    },
    "sagrada-familia": {
        "concept": "Sagrada Família daytime facade with Barcelona street life",
        "prompt": (
            "Photorealistic daytime photograph of Sagrada Família in Barcelona, rich blue sky, warm sunlight "
            "highlighting intricate details, bustling street, colorful surroundings."
        ),
        "edit_instruction": (
            "Revise this Sagrada Família image into a sunlit Barcelona afternoon with rich blue sky, glowing stone details, "
            "and lively street life. Keep colors saturated and realistic."
        ),
        "negative_prompt": "monochrome, night scene, low saturation, illustration, distortion",
    },
}


def configure_models() -> Tuple[
    Optional[genai.Client],
    Optional["legacy_genai.GenerativeModel"],
    Optional[genai.Client],
]:
    api_key = (
        os.getenv("GOOGLE_GENAI_API_KEY")
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )
    if not api_key:
        raise RuntimeError("환경변수(GOOGLE_API_KEY 또는 GEMINI_API_KEY)가 설정되지 않았습니다.")

    legacy_genai.configure(api_key=api_key)

    image_client: Optional[genai.Client] = None
    if ENABLE_IMAGE_GENERATION:
        try:
            image_client = genai.Client(api_key=api_key)
        except Exception as exc:
            print(f"⚠️ 이미지 생성 클라이언트 초기화 실패: {exc}")
            image_client = None

    if os.getenv("DISABLE_PROMPT_REFINEMENT", "").lower() in {"1", "true", "yes"}:
        text_model = None
    else:
        text_model = None
        try:
            text_model = legacy_genai.GenerativeModel(model_name=TEXT_MODEL_NAME)
        except Exception as exc:
            print(f"⚠️ 텍스트 프롬프트 모델 초기화 실패({TEXT_MODEL_NAME}): {exc}")
            text_model = None

    edit_client: Optional[genai.Client] = None
    if ENABLE_IMAGE_EDIT:
        try:
            edit_client = genai.Client(api_key=api_key)
        except Exception as exc:
            print(f"⚠️ 이미지 편집 클라이언트 초기화 실패: {exc}")
            edit_client = None

    return image_client, text_model, edit_client


def generate_detailed_prompt(
    text_model: Optional["legacy_genai.GenerativeModel"],
    slug: str,
    prompt_config: dict,
) -> str:
    base_prompt = prompt_config["prompt"]
    if not text_model:
        return base_prompt

    instruction = (
        "You are designing a single, vivid prompt for an image generation model.\n"
        "Requirements:\n"
        "1. Keep it under 80 words.\n"
        "2. Cover lighting, atmosphere, and notable subjects or actions.\n"
        "3. Specify 16:9 composition cues when useful.\n"
        "4. Avoid camera brand names.\n"
        f"Concept: {prompt_config.get('concept', slug)}.\n"
        f"Baseline details: {base_prompt}\n"
        "Respond only with the refined prompt text."
    )

    try:
        response = text_model.generate_content(instruction)
        refined = getattr(response, "text", "") or ""
        refined = refined.strip()

        if not refined and getattr(response, "candidates", None):
            refined = response.candidates[0].content.parts[0].text.strip()

        if refined:
            print(f"   ↳ 텍스트 프롬프트 생성 완료: {refined[:80]}{'...' if len(refined) > 80 else ''}")
            return refined
    except Exception as exc:
        print(f"⚠️ {slug} 프롬프트 생성 실패, 기본 문구 사용: {exc}")

    return base_prompt


def generate_image(
    image_client: genai.Client,
    text_model: Optional["legacy_genai.GenerativeModel"],
    slug: str,
    prompt_config: dict,
) -> None:
    print(f"🎨 {slug} 이미지 생성 중...")
    base_prompt = generate_detailed_prompt(text_model, slug, prompt_config)
    negative = prompt_config.get("negative_prompt")
    final_prompt = base_prompt if not negative else f"{base_prompt}\nAvoid: {negative}"

    response = image_client.models.generate_images(
        model=IMAGE_MODEL_NAME,
        prompt=final_prompt,
        config=genai_types.GenerateImagesConfig(
            number_of_images=1,
            output_mime_type="image/webp",
            aspect_ratio="16:9",
        ),
    )

    image_bytes = extract_image_bytes(response, slug)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    webp_path = OUTPUT_DIR / f"{slug}.webp"
    image.save(webp_path, format="WEBP", quality=95, method=6)
    print(f"✅ {slug} → {webp_path.relative_to(ROOT_DIR)} 저장 완료")


def edit_existing_image(
    edit_client: genai.Client,
    slug: str,
    prompt_config: dict,
) -> None:
    source_path = OUTPUT_DIR / f"{slug}.webp"
    if not source_path.exists():
        print(f"⚠️ {slug} 편집 건너뜀: 원본 이미지가 없습니다 ({source_path})")
        return

    instruction = prompt_config.get("edit_instruction") or prompt_config["prompt"]
    print(f"🛠️ {slug} 이미지 편집 중...")

    with Image.open(source_path) as img:
        img = img.convert("RGB")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        image_bytes = buffer.getvalue()

    reference_image = genai_types.RawReferenceImage(
        reference_image=genai_types.Image(image_bytes=image_bytes, mime_type="image/png"),
        reference_id=1,
    )

    response = edit_client.models.edit_image(
        model=IMAGE_EDIT_MODEL_NAME,
        prompt=instruction,
        reference_images=[reference_image],
        config=genai_types.EditImageConfig(
            number_of_images=1,
            output_mime_type="image/webp",
            aspect_ratio="16:9",
        ),
    )

    edited_bytes = extract_image_bytes(response, slug, mode="편집")
    edited_path = OUTPUT_DIR / f"{slug}-edited.webp"
    Image.open(io.BytesIO(edited_bytes)).convert("RGB").save(edited_path, format="WEBP", quality=95, method=6)
    print(f"✅ {slug} 편집본 저장 완료 → {edited_path.relative_to(ROOT_DIR)}")


def extract_image_bytes(response, slug: str, mode: str = "생성") -> bytes:
    """
    Imagen generate_images/이미지 편집 응답에서 이미지 바이트를 추출한다.
    """
    image_list = getattr(response, "generated_images", None) or getattr(response, "images", None)
    if not image_list:
        raise RuntimeError(f"{slug} {mode} 실패: 응답에 이미지 데이터가 없습니다.")

    first_image = image_list[0]
    payload = getattr(first_image, "image", first_image)
    image_bytes = None

    if hasattr(payload, "image_bytes") and payload.image_bytes:
        image_bytes = payload.image_bytes
    elif isinstance(payload, (bytes, bytearray)):
        image_bytes = bytes(payload)
    elif hasattr(payload, "bytes") and payload.bytes:
        image_bytes = payload.bytes

    if not image_bytes:
        raise RuntimeError(f"{slug} {mode} 실패: 이미지 바이트가 비어 있습니다.")

    return _ensure_bytes(image_bytes)


def _ensure_bytes(data, *, strict: bool = True) -> Optional[bytes]:
    """
    API 응답에서 반환되는 데이터가 base64 문자열일 수도 있고 이미 바이너리일 수도 있으므로
    안전하게 bytes로 변환한다.
    """
    if data is None:
        return None

    if isinstance(data, bytes):
        return data

    if isinstance(data, str):
        try:
            return base64.b64decode(data, validate=True)
        except (binascii.Error, ValueError):
            if strict:
                raise
            try:
                return data.encode("utf-8")
            except Exception:
                return None

    if strict:
        raise TypeError(f"알 수 없는 데이터 타입입니다: {type(data)}")
    return None


def main() -> None:
    image_client, text_model, edit_client = configure_models()

    if image_client:
        for slug, prompt in LANDMARK_PROMPTS.items():
            try:
                generate_image(image_client, text_model, slug, prompt)
            except Exception as exc:
                print(f"⚠️ {slug} 생성 중 오류: {exc}")

    if edit_client:
        for slug, prompt in LANDMARK_PROMPTS.items():
            try:
                edit_existing_image(edit_client, slug, prompt)
            except Exception as exc:
                print(f"⚠️ {slug} 편집 중 오류: {exc}")


if __name__ == "__main__":
    main()
