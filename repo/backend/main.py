import os
import json
import shutil
import tempfile
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from services.diarization import DiarizationService
from services.transcription import TranscriptionService
from services.recap_generator import RecapGenerator
from services.email_service import EmailService

load_dotenv()

app = FastAPI(title="TRPG史诗纪要生成器API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

diarization_service = DiarizationService()
transcription_service = TranscriptionService()
recap_generator = RecapGenerator()
email_service = EmailService()


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "TRPG史诗纪要生成器API运行正常"}


@app.post("/api/process-session")
async def process_session(
    audio_file: UploadFile = File(...),
    characters: str = Form(...),
    story_nodes: str = Form(...),
    recipient_emails: str = Form(...)
):
    temp_audio_path = None
    
    try:
        characters_data = json.loads(characters)
        story_nodes_data = json.loads(story_nodes)
        emails_data = json.loads(recipient_emails)
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
            shutil.copyfileobj(audio_file.file, temp_file)
            temp_audio_path = temp_file.name
        
        diarization_segments = diarization_service.diarize(temp_audio_path)
        
        transcript = transcription_service.transcribe_with_speakers(
            temp_audio_path,
            diarization_segments
        )
        
        recap_markdown = recap_generator.generate(
            characters_data,
            story_nodes_data,
            transcript
        )
        
        title = "冒险战报"
        if characters_data and len(characters_data) > 0:
            title = f"{characters_data[0].get('name', '冒险')}的史诗"
        
        email_subject = f"🎲 TRPG战报 - {title}"
        email_service.send_recap(emails_data, email_subject, recap_markdown)
        
        return {
            "success": True,
            "message": "战报生成并发送成功！",
            "recap": recap_markdown,
            "transcript": transcript,
            "diarization": diarization_segments
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if temp_audio_path and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)


@app.post("/api/test-recap")
async def test_recap(
    characters: str = Form(...),
    story_nodes: str = Form(...)
):
    try:
        characters_data = json.loads(characters)
        story_nodes_data = json.loads(story_nodes)
        
        mock_transcript = [
            {"speaker": "SPEAKER_00", "text": "我们进入了黑暗的洞穴，四周一片寂静。", "start": 0, "end": 5},
            {"speaker": "SPEAKER_01", "text": "我听到了什么声音...好像是从左边传来的。", "start": 5, "end": 10},
            {"speaker": "SPEAKER_00", "text": "小心！有哥布林！准备战斗！", "start": 10, "end": 15},
            {"speaker": "SPEAKER_02", "text": "我来施放火球术！", "start": 15, "end": 20},
            {"speaker": "SPEAKER_01", "text": "火球术命中了！哥布林们四处逃窜。", "start": 20, "end": 25},
            {"speaker": "SPEAKER_00", "text": "我们赢了！但我感觉这只是开始...", "start": 25, "end": 30}
        ]
        
        recap_markdown = recap_generator.generate(
            characters_data,
            story_nodes_data,
            mock_transcript
        )
        
        return {
            "success": True,
            "message": "测试战报生成成功！",
            "recap": recap_markdown
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
