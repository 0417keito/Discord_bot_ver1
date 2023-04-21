import sys
from convert_utils import whisper, send_chatgpt, convert_audio, infer



def run(wav_file):
     '''
     with open(pcm_file, 'rb') as pcm_f:
        pcm_data = pcm_f.read()
        time = datetime.datetime.now()
        wav_file = '/audio_file/discord_stream_audio/wav_file/output_{}.wav'.format(time)
        with wave.open(wav_file, 'wb') as wav_f:
            wav_f.setparams((channels, sample_width, sample_rate, 0, 'NONE', 'NONE'))
            wav_f.writeframes(pcm_data)
     '''
     
            
     message = whisper(wav_file)
     result = send_chatgpt(message)
     reply_audio = convert_audio(result)
     output = infer(input_audio=reply_audio)
     print(output)
     
     
if __name__ == '__main__':
     audio_path = sys.argv[1]
     run(wav_file=audio_path)

