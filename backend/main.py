from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from typing import List
from yolo_inference import infer

app = FastAPI(title="AnnotateAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_FORMATS = {".jpg", ".jpeg", ".png", ".webp"}

@app.post("/api/infer")
async def infer_endpoint(
    file: UploadFile = File(...),
    confidence: float = Form(0.25),
    iou: float = Form(0.45),
):
    ext = "." + file.filename.rsplit(".", 1)[-1].lower()
    if ext not in SUPPORTED_FORMATS:
        return {"error": f"Unsupported format: {ext}. Use JPG, PNG, or WebP."}

    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    result = infer(image, confidence, iou)
    return result

@app.post("/api/infer-batch")
async def infer_batch(
    files: List[UploadFile] = File(...),
    confidence: float = Form(0.25),
    iou: float = Form(0.45),
):
    results = []
    for f in files:
        ext = "." + f.filename.rsplit(".", 1)[-1].lower()
        if ext not in SUPPORTED_FORMATS:
            continue
        contents = await f.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        result = infer(image, confidence, iou)
        result["name"] = f.filename
        results.append(result)
    return {"results": results}

@app.get("/api/health")
async def health():
    return {"status": "ok"}
