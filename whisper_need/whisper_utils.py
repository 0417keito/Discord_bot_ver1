OPENAI_API = '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'
import openai
openai.api_key = OPENAI_API

class WhisperModelWrapper:
    def __init__(self):
        self.model_size = 'whisper1'
    
    def transcript(self, audio):
        transcript = openai.Audio.transcribe(self.model_size, audio)
        return transcript






'''
from faster_whisper import WhisperModel


class WhisperModelWrapper:
    def __init__(self):
        self.model_size = "large-v2"
        self.model = WhisperModel(
            self.model_size, device="cuda", compute_type="float16"
        )

    def transcribe(self, audio):
        segments, _ = self.model.transcribe(
            audio=audio, beam_size=5, language="ja", word_timestamps=True
        )
        return segments
'''