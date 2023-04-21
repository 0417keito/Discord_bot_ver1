import sys
from convert_utils import whisper, send_chatgpt, convert_audio, infer
import logging



def run(wav_file):
     message = whisper(wav_file)
     result = send_chatgpt(message)
     reply_audio = convert_audio(result)
     output = infer(input_audio=reply_audio)
     print(output)
     sys.stdout.flush()
     
     
if __name__ == '__main__':
     logging.info('start python')
     audio_path = sys.argv[1]
     run(wav_file=audio_path)
     logging.info('end python')

