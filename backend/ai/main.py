from fastapi import FastAPI, UploadFile, File, Response
import cv2
import numpy as np

from motion_detector import IntelligentMotionDetector
from human_detector import HumanDetector

app = FastAPI(title="VirtualEye AI Module")

# Initialize models globally (loaded exactly once)
motion_tracker = IntelligentMotionDetector()
human_tracker = HumanDetector()

@app.post("/detect")
async def detect_human(image: UploadFile = File(...)):
    # Read raw image payload
    contents = await image.read()
    npimg = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    if frame is None:
        return {"error": "Failed to decode image"}
    
    # 1. Step: Motion Detection Check
    motion_res = motion_tracker.detect(frame)
    
    if not motion_res["motionDetected"]:
        return {
            "motion": motion_res,
            "human": {
                "detected": False,
                "confidence": 0.0,
                "timestamp": 0.0,
                "skipped": True
            }
        }
        
    # 2. Step: Human Detection run conditionally to save performance
    human_res = human_tracker.detect(frame)
    human_res["skipped"] = False
    
    return {
        "motion": motion_res,
        "human": human_res
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
