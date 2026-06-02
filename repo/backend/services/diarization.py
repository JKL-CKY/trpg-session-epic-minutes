import os
from pyannote.audio import Pipeline
from typing import List, Dict, Any


class DiarizationService:
    def __init__(self):
        self.huggingface_token = os.getenv("HUGGINGFACE_TOKEN")
        self.pipeline = None

    def _load_pipeline(self):
        if self.pipeline is None:
            self.pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization-3.1",
                use_auth_token=self.huggingface_token
            )

    def diarize(self, audio_path: str) -> List[Dict[str, Any]]:
        self._load_pipeline()
        diarization = self.pipeline(audio_path)
        
        segments = []
        for turn, _, speaker in diarization.itertracks(yield_label=True):
            segments.append({
                "start": turn.start,
                "end": turn.end,
                "speaker": speaker
            })
        
        return segments
