import torch
import numpy as np
from scipy.io.wavfile import write
from modules.models import VC_MODEL
import os
from modules.cmd_opts import opts
from modules.shared import ROOT_DIR
MODELS_DIR = opts.models_dir or os.path.join(ROOT_DIR, "models")
import datetime
import random

from faster_whisper import WhisperModel

from gtts import gTTS

model_name = "kato_conversation.pth"

OPENAI_KEY = 

import openai
openai.api_key = OPENAI_KEY

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


#OpenAIのwhisperのAPIにファイルをおくってそれを文字お越しする
def whisper(audio_path):
    audio_file = open(audio_path, "rb")
    transcript = openai.Audio.transcribe("whisper-1", audio_file)
    message = transcript['text']
    print(message)
    return message


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
    messages = [
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": message},
    ]
    
    res = openai.ChatCompletion.create(
        model = 'gpt-3.5-turbo', 
        messages = messages,
        temperature = 0.0,
    )
    
    return(res['choices'][0]['message']['content'].strip())


def convert_audio(result):
    tts = gTTS(result, lang='ja') 
    date_str = datetime.datetime.now().strftime("%Y-%m-%d_%H_%M_%S")  # コロンをアンダースコアに置き換えています
    random_str = f"{random.randint(1000, 9999)}"
    save_path = 'audio_file/TTS_audio/gTTS_test_{}_{}.mp3'.format(date_str,random_str)
    tts.save(save_path)
    return save_path

def infer(input_audio):
    sid = 0
    input_audio = input_audio
    f0_up_key = 0
    f0_file = None
    f0_method = 'harvest'
    file_index = "weights/kato_conversation/added_IVF657_Flat_nprobe_7"
    file_big_npy = "weights/kato_conversation/total_fea.npy"
    index_rate = 1
    
    model_path = os.path.join(MODELS_DIR, "checkpoints", model_name)
    weight = torch.load(model_path, map_location="cpu")
    model = VC_MODEL(model_name, weight)
    audio = model.single(sid,input_audio,f0_up_key,f0_file,f0_method,file_index,file_big_npy,index_rate,)

    tgt_sr = model.tgt_sr
    audio_opt = audio
    
    date_str = datetime.datetime.now().strftime("%Y-%m-%d_%H_%M_%S")  # コロンをアンダースコアに置き換えています
    random_str = f"{random.randint(1000, 9999)}"
    output_file = 'audio_file/output_audio/output_{}.wav'.format(date_str,random_str)
    write(output_file, tgt_sr, audio_opt.astype(np.int16))
    return output_file
        

