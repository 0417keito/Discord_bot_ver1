import sys
from convert_utils import whisper, send_chatgpt, convert_audio, infer


def run(audio_path):
     message = whisper(audio_path)
     result = send_chatgpt(message)
     reply_audio = convert_audio(result)
     infer(input_audio=reply_audio)
     
     
     
audio_path = sys.argv[1]
run(audio_path=audio_path)
