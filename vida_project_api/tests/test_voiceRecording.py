import pytest
from feature_spikePredownloading.voiceRecording import similarity, verify_voice

def test_similarity():
    assert similarity(0.8) == True 

    assert similarity(0.5) == False

    assert similarity(0.7) == False

    assert similarity(0.71) == True

def test_verify_voice_similarity_high(mocker):
    mocker.patch('feature_spikePredownloading.voiceRecording.recording', return_value='mocked_voice')
    mocker.patch('feature_spikePredownloading.voiceRecording.extract_embedding', return_value='mocked_embedding')

    verification = mocker.Mock()
    verification.encode_batch.return_value = 'mocked_embedding'
    verification.similarity.return_value = 0.8

    result = verify_voice(verification, 'mocked_voice')
    assert result is True

def test_verify_voice_similarity_low(mocker):
    mocker.patch('feature_spikePredownloading.voiceRecording.recording', return_value='mocked_voice')
    mocker.patch('feature_spikePredownloading.voiceRecording.extract_embedding', return_value='mocked_embedding')

    verification = mocker.Mock()
    verification.encode_batch.return_value = 'mocked_embedding'
    verification.similarity.return_value = 0.5

    result = verify_voice(verification, 'mocked_voice')
    assert result is False