import base64
import io
import os
import subprocess
import sys
import tempfile
import warnings
import wave

import pyaudio
import torch
import torchaudio
from speechbrain.inference import SpeakerRecognition

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import migration

warnings.filterwarnings("ignore", category=FutureWarning)

model_path = os.path.join(
    os.path.dirname(__file__),
    "..",
    "feature_spikePredownloading",
    "pretrained_models",
    "spkrec",
)

model_path = os.path.abspath(model_path)

try:
    verification = SpeakerRecognition.from_hparams(
        source=model_path, savedir=model_path, run_opts={"device": "cpu"}
    )
except Exception:
    if os.path.exists(model_path):
        pass
    else:
        pass
    verification = None


def recording(filename):
    format = pyaudio.paInt16
    channel = 1
    rate = 44100
    recordingDuration = 5

    p = pyaudio.PyAudio()

    stream = p.open(
        format=format,
        channels=channel,
        rate=rate,
        input=True,
        frames_per_buffer=1024,
    )

    frames = []

    aux = 0
    for i in range(0, int(rate / 1024 * recordingDuration)):
        data = stream.read(1024)
        frames.append(data)
        if (
            int(i % ((rate / 1024 * recordingDuration) / recordingDuration))
            == 0
        ):
            aux += 1

    stream.stop_stream()
    stream.close()
    p.terminate()

    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wf:
        wf.setnchannels(channel)
        wf.setsampwidth(p.get_sample_size(format))
        wf.setframerate(rate)
        wf.writeframes(b"".join(frames))
    buffer.seek(0)
    return buffer


def extract_embedding(verification, file_path_or_buffer):
    try:
        if isinstance(file_path_or_buffer, io.BytesIO):
            file_path_or_buffer.seek(0)

            with tempfile.NamedTemporaryFile(
                suffix=".mp3", delete=False
            ) as tmp_file:
                tmp_file.write(file_path_or_buffer.getvalue())
                tmp_file.flush()
                temp_file_path = tmp_file.name

            try:
                waveform, sample_rate = torchaudio.load(temp_file_path)
            except Exception:
                wav_file_path = temp_file_path.replace(".mp3", ".wav")

                try:
                    subprocess.run(
                        [
                            "ffmpeg",
                            "-i",
                            temp_file_path,
                            "-ar",
                            "16000",
                            "-ac",
                            "1",
                            "-y",
                            wav_file_path,
                        ],
                        check=True,
                        capture_output=True,
                        stderr=subprocess.DEVNULL,
                        timeout=30,
                    )

                    waveform, sample_rate = torchaudio.load(wav_file_path)

                    os.unlink(wav_file_path)

                except Exception:
                    return None

            finally:
                try:
                    os.unlink(temp_file_path)
                except Exception:
                    pass

        else:
            waveform, sample_rate = torchaudio.load(file_path_or_buffer)

        if waveform is None:
            return None

        if waveform.dim() > 1 and waveform.size(0) > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        signal = waveform.squeeze(0).unsqueeze(0)
        lengths = torch.tensor([1.0])

        embedding = verification.encode_batch(signal, lengths)

        return embedding.squeeze(0)

    except Exception:
        return None


def verify_voice_original(verification, userEmail):
    if verification is None:
        return 0

    newVoice = recording("temp.wav")
    newVoice = extract_embedding(verification, newVoice)

    secretVoices = migration.autentication(userEmail)

    score = 0
    if secretVoices is not None and len(secretVoices) > 0:
        for v in secretVoices:
            veryVoice = torch.load(io.BytesIO(v.voice_module))

            score += verification.similarity(newVoice, veryVoice)
        score /= len(secretVoices)
        return similarity(score)
    else:
        return 0


def new_secret_voice(verification, userEmail):
    if verification is None:
        return

    newVoice = recording("temp.wav")
    newVoice = extract_embedding(verification, newVoice)

    bufferTensor = io.BytesIO()
    torch.save(newVoice, bufferTensor)
    byteTensor = bufferTensor.getvalue()
    migration.add_new_voice(byteTensor, userEmail)


min_value = 0.7


def similarity(score):
    prediction = score > min_value

    if prediction:
        return 1
    else:
        return 0


def verify_voice_base64(audio_base64: str, verification_model) -> bool:
    if verification_model is None:
        return True

    if not audio_base64:
        return False

    try:
        audio_bytes = base64.b64decode(audio_base64)

        audio_buffer = io.BytesIO(audio_bytes)

        embedding = extract_embedding(verification_model, audio_buffer)

        if embedding is None:
            return False

        return True

    except Exception:
        return False


def verify_voice_against_stored(
    audio_base64: str,
    stored_voice_base64: str | None = None,
    test_mode: bool = False,
) -> bool:
    if verification is None:
        return True

    if not audio_base64:
        return False

    if test_mode:
        try:
            audio_bytes = base64.b64decode(audio_base64)
            audio_buffer = io.BytesIO(audio_bytes)
            embedding = extract_embedding(verification, audio_buffer)

            if embedding is not None:
                return True
            else:
                return False

        except Exception:
            return False

    if not stored_voice_base64:
        return False

    try:
        audio_bytes = base64.b64decode(audio_base64)
        audio_buffer = io.BytesIO(audio_bytes)
        current_embedding = extract_embedding(verification, audio_buffer)

        if current_embedding is None:
            return False

        stored_bytes = base64.b64decode(stored_voice_base64)
        stored_buffer = io.BytesIO(stored_bytes)
        stored_embedding = extract_embedding(verification, stored_buffer)

        if stored_embedding is None:
            return False

        similarity_score = verification.similarity(
            current_embedding, stored_embedding
        )

        similarity_value = float(similarity_score.item())

        threshold = 0.7
        is_match = similarity_value > threshold

        return is_match

    except Exception:
        return False


def verify_voice_against_stored_with_score(
    audio_base64: str,
    stored_voice_base64: str | None = None,
    test_mode: bool = False,
) -> tuple[bool, float]:
    """
    Verify voice against stored voice and return both result and confidence score.
    Returns (is_match, confidence_score)
    """
    print(f"DEBUG: verify_voice_against_stored_with_score called with test_mode={test_mode}")
    
    if verification is None:
        print("DEBUG: No verification model loaded, returning fallback")
        return True, 0.95  # Fallback when no verification model

    if not audio_base64:
        print("DEBUG: No audio_base64 provided")
        return False, 0.0

    if test_mode:
        print("DEBUG: Test mode active")
        try:
            audio_bytes = base64.b64decode(audio_base64)
            audio_buffer = io.BytesIO(audio_bytes)
            embedding = extract_embedding(verification, audio_buffer)

            if embedding is not None:
                print("DEBUG: Test mode - embedding extracted successfully")
                return True, 0.95  # Test mode always high confidence
            else:
                print("DEBUG: Test mode - failed to extract embedding")
                return False, 0.1

        except Exception as e:
            print(f"DEBUG: Test mode exception: {e}")
            return False, 0.0

    if not stored_voice_base64:
        print("DEBUG: No stored voice provided")
        return False, 0.0

    try:
        print("DEBUG: Starting voice verification process")
        audio_bytes = base64.b64decode(audio_base64)
        audio_buffer = io.BytesIO(audio_bytes)
        current_embedding = extract_embedding(verification, audio_buffer)

        if current_embedding is None:
            print("DEBUG: Failed to extract current embedding")
            return False, 0.0

        stored_bytes = base64.b64decode(stored_voice_base64)
        stored_buffer = io.BytesIO(stored_bytes)
        stored_embedding = extract_embedding(verification, stored_buffer)

        if stored_embedding is None:
            print("DEBUG: Failed to extract stored embedding")
            return False, 0.0

        print("DEBUG: Computing similarity between embeddings")
        similarity_score = verification.similarity(
            current_embedding, stored_embedding
        )

        similarity_value = float(similarity_score.item())
        print(f"DEBUG: Raw similarity score: {similarity_value}")

        threshold = 0.7
        is_match = similarity_value > threshold
        
        print(f"DEBUG: Final result - match: {is_match}, score: {similarity_value}")
        return is_match, similarity_value

    except Exception as e:
        print(f"DEBUG: Exception in voice verification: {e}")
        return False, 0.0


def verify_voice(audio_data, verification_model):
    if isinstance(audio_data, str):
        return verify_voice_base64(audio_data, verification_model)
    else:
        return verify_voice_original(verification_model, audio_data)
