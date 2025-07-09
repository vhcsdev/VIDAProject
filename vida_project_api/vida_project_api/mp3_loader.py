import base64
import io
import os
import subprocess
import tempfile
import torch
import torchaudio


def load_mp3_from_base64(audio_base64: str):
    try:
        audio_bytes = base64.b64decode(audio_base64)

        with tempfile.NamedTemporaryFile(
            suffix=".mp3", delete=False
        ) as mp3_file:
            mp3_file.write(audio_bytes)
            mp3_file.flush()
            mp3_path = mp3_file.name

        try:
            waveform, sample_rate = torchaudio.load(mp3_path)
            os.unlink(mp3_path)
            return waveform, sample_rate
        except Exception:
            pass

        wav_path = mp3_path.replace(".mp3", ".wav")

        cmd = [
            "ffmpeg",
            "-i",
            mp3_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-sample_fmt",
            "s16",
            "-y",
            wav_path,
        ]

        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=30, check=False
        )

        if result.returncode == 0:
            waveform, sample_rate = torchaudio.load(wav_path)

            os.unlink(mp3_path)
            os.unlink(wav_path)

            return waveform, sample_rate

        try:
            os.unlink(mp3_path)
        except Exception:
            pass
        try:
            os.unlink(wav_path)
        except Exception:
            pass

        return None, None

    except Exception:
        return None, None


def extract_embedding_simple(verification_model, audio_base64: str):
    waveform, sample_rate = load_mp3_from_base64(audio_base64)

    if waveform is None:
        return None

    try:
        if waveform.dim() > 1 and waveform.size(0) > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        signal = waveform.squeeze(0).unsqueeze(0)
        lengths = torch.tensor([1.0])

        embedding = verification_model.encode_batch(signal, lengths)
        result = embedding.squeeze(0)

        return result

    except Exception:
        return None
