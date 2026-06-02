import os
import whisper
from pydub import AudioSegment
from typing import List, Dict, Any


class TranscriptionService:
    def __init__(self, model_name: str = "base"):
        self.model = whisper.load_model(model_name)

    def transcribe_segment(self, audio_path: str, start: float, end: float) -> str:
        audio = AudioSegment.from_file(audio_path)
        segment = audio[start * 1000:end * 1000]
        
        temp_path = f"temp_segment_{start}_{end}.wav"
        segment.export(temp_path, format="wav")
        
        try:
            result = self.model.transcribe(temp_path, language="zh")
            return result["text"].strip()
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def transcribe_with_speakers(
        self, 
        audio_path: str, 
        diarization_segments: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        transcript = []
        
        for seg in diarization_segments:
            text = self.transcribe_segment(audio_path, seg["start"], seg["end"])
            if text:
                transcript.append({
                    "speaker": seg["speaker"],
                    "text": text,
                    "start": seg["start"],
                    "end": seg["end"]
                })
        
        return transcript
