# Audio for the 500-phrase project

1,000 synthetic phrase clips (500 texts in each of two German voices), packaged in 20 MP3 files. The manifest provides phrase start/end boundaries. Runtime playback does not need browser speech synthesis or a separately installed German voice. Internet is needed to load the MP3 packs; this release does not add an audio offline download feature.

- Male: Piper `de_DE-thorsten-medium`; Thorsten Voice, CC0 dataset. https://github.com/thorstenMueller/Thorsten-Voice
- Female: Piper `de_DE-ramona-low`, M-AILABS dataset. Model and dataset terms: https://huggingface.co/rhasspy/piper-voices/blob/main/de/de_DE/ramona/low/MODEL_CARD and https://www.caito.de/2019/01/03/the-m-ailabs-speech-dataset/
- Models: https://huggingface.co/rhasspy/piper-voices
- Generator: piper-tts 1.3.0, onnxruntime 1.31.1, ffmpeg MP3 32 kbit/s. Model files are not committed. `scripts/build_project90_audio.py` reproduces the files given local model paths; ORT telemetry is disabled before import and through its API.
- Ramona phonemes are NFC normalized to match the model's original phoneme inventory, including German ich-Laut.

These are synthetic voices, not recordings or clones of Jefferson, Sofia or ChatGPT. A selected voice and playback speed are controls, not a pronunciation assessment.
