import pyaudio
import wave
import time
import torchaudio
from pathlib import Path
from speechbrain.inference import SpeakerRecognition
import torch
from datetime import datetime
import warnings
warnings.filterwarnings("ignore", category=FutureWarning)

testingVoice = "testingVoice.wav"
secretVoice = "secretVoice.wav"

#Recording function
def recording(filename):
    format = pyaudio.paInt16
    channel = 1
    rate = 44100
    recordingDuration = 5

    p = pyaudio.PyAudio()

    stream = p.open(format=format, 
                    channels=channel,
                    rate = rate,
                    input=True,
                    frames_per_buffer=1024)

    frames = []

    print(f"Recording duration: {recordingDuration}s")
    if(filename == "testingVoice.wav"): print("Testing voice recording")
    elif(filename == "secretVoice.wav"): print("Secret voice recording")

    aux = 0
    for i in range(0, int(rate / 1024 * recordingDuration)):
        data = stream.read(1024)
        frames.append(data)
        if int(i % ((rate / 1024 * recordingDuration)/recordingDuration)) == 0:
            print(f"{aux}s")
            aux+=1

    print("Finish recording.")

    stream.stop_stream()
    stream.close()
    p.terminate()
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(channel)
        wf.setsampwidth(p.get_sample_size(format))
        wf.setframerate(rate)
        wf.writeframes(b''.join(frames))

#Check if secret .wav recording exists
arquivo = Path("secretVoice.wav")
if(not arquivo.exists() and not arquivo.is_file()):
    recording(secretVoice)

recording(testingVoice)

#Extract embedding from a .wav audio
def extract_embedding(verification, file_path):
    signal = verification.load_audio(file_path)
    signal = signal.unsqueeze(0)
    lengths = torch.tensor([1.0])

    embedding = verification.encode_batch(signal, lengths)
    return embedding.squeeze(0)

verification = SpeakerRecognition.from_hparams(
                        source="pretrained_models/spkrec",
                        savedir="pretrained_models/spkrec")

#Secret embedding
embedding_path = Path("embeddings/secret_embedding.pt")
if not embedding_path.exists():
    secret_embedding = extract_embedding(verification, secretVoice)

    embedding_path.parent.mkdir(parents=True, exist_ok=True)

    torch.save(secret_embedding, embedding_path)
else:
    secret_embedding = torch.load(embedding_path)

#Testing voice embedding
testing_embedding = extract_embedding(verification, testingVoice)

#Verification
score = verification.similarity(testing_embedding, secret_embedding)

def similarity(score):
    prediction = score > -1.75
    print(f"Score: {score}, Match: {prediction}")

    if(prediction):
        print("\nValid authentication")
    else:
        print("\nInvalid voice")

similarity(score)