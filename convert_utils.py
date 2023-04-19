import torch
import numpy as np
from scipy.io.wavfile import write
from modules.models import VC_MODEL
import os
from modules.cmd_opts import opts
from modules.shared import ROOT_DIR
MODELS_DIR = opts.models_dir or os.path.join(ROOT_DIR, "models")

from faster_whisper import WhisperModel

from gtts import gTTS

model_name = "kato_conversation.pth"

OPENAI_KEY = 'your openai key'

import openai
openai.api_key = OPENAI_KEY

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
spk_item = 0
vc_transform0 = 0
input_audio0 = "C:\\Users\\mnooh\\Downloads\\Shorts.mp3"
f0method0 = 'harvest'
file_index1 =  "weights/kato_conversation/added_IVF657_Flat_nprobe_7"
file_big_npy1 = "weights/kato_conversation/total_fea.npy"
index_rate1 = 1
f0_file = None

#OpenAIのwhisperのAPIにファイルをおくってそれを文字お越しする
def whisper(audio_path):
    audio_file = open(audio_path, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    print(transcript["text"])


'''
def whisper(audio_path):
    model_size = "large-v2"
    model = WhisperModel(model_size, device="cuda", compute_type="float16")
    segments, info = model.transcribe(audio=audio_path, beam_size=5)
    messages = []
    for segment in segments:
        text = segment.text
        messages.append(text)
    return messages
'''            
       
 
def send_chatgpt(message):
    res = openai.ChatCompletion.create(
        model = 'gpt-3.5-turbo',
        message = [{'role':'user', 'content':message}])
    
    return(res['choices'][0]['message']['content'])


def convert_audio(result):
    tts = gTTS(result, lang='ja') 
    tts.save('audio_file/TTS_audio/gTTS_test.mp3')
    reply_audio = 'audio_file/TTS_audio/gTTS_test.mp3'
    return reply_audio

def infer(sid = spk_item,input_audio = input_audio0,f0_up_key = vc_transform0,f0_file = f0_file,
        f0_method = f0method0,file_index = file_index1,file_big_npy = file_big_npy1,index_rate = index_rate1,):
    
        model_path = os.path.join(MODELS_DIR, "checkpoints", model_name)
        weight = torch.load(model_path, map_location="cpu")
        model = VC_MODEL(model_name, weight)
        audio = model.single(sid,input_audio,f0_up_key,f0_file,f0_method,file_index,file_big_npy,index_rate,)

        tgt_sr = model.tgt_sr
        audio_opt = audio
    
        output_file = 'audio_file/output_audio/output.wav'
        write(output_file, tgt_sr, audio_opt.astype(np.int16))
        return output_file
        

