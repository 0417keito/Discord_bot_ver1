import pyaudio

# オーディオストリームを作成する関数
def create_audio_stream(selected_device_index, callback):
    RATE = 16000
    CHUNK = 480
    FORMAT = pyaudio.paInt16
    CHANNELS = 1

    audio = pyaudio.PyAudio()
    stream = audio.open(
        format=FORMAT,
        channels=CHANNELS,
        rate=RATE,
        input=True,
        input_device_index=selected_device_index,
        frames_per_buffer=CHUNK,
        stream_callback=callback,
    )

    return stream
