"""Generate two hosted German voices in 50-phrase MP3 packs; model paths passed as arguments."""
import os
os.environ["ORT_DISABLE_TELEMETRY"]="1"
import io,json,wave,subprocess,sys,pathlib,time,unicodedata
import numpy as np
import onnxruntime as ort
ort.disable_telemetry_events()
from piper import PiperVoice,SynthesisConfig
root=pathlib.Path(__file__).resolve().parents[1]
phrases=json.loads((root/'project90-phrases.json').read_text())['phrases']
out=root/'project90-audio';out.mkdir(exist_ok=True)
manifest=json.loads((out/'manifest.json').read_text()) if os.environ.get('ONLY_FEMALE') else {'version':1,'voices':['male','female'],'clips':{}}
for voice_name,model in zip(['male','female'],sys.argv[1:]):
    if os.environ.get('ONLY_FEMALE') and voice_name=='male':continue
    voice=PiperVoice.load(model)
    if voice_name=='female':
        original_phonemize=voice.phonemize
        voice.phonemize=lambda text:[list(unicodedata.normalize('NFC',''.join(sentence))) for sentence in original_phonemize(text)]
    opts=ort.SessionOptions();opts.intra_op_num_threads=2;opts.inter_op_num_threads=1
    voice.session=ort.InferenceSession(model,sess_options=opts,providers=['CPUExecutionProvider'])
    rate=voice.config.sample_rate
    for pack in range(10):
        path=out/f'{voice_name}-{pack+1:02}.mp3'
        pcm=[];samples=0
        for p in phrases[pack*50:(pack+1)*50]:
            buf=io.BytesIO()
            with wave.open(buf,'wb') as w:voice.synthesize_wav(p['de'].replace('IT.','I T.').replace('WLAN','W-LAN'),w,syn_config=SynthesisConfig(length_scale=1.08))
            buf.seek(0)
            with wave.open(buf,'rb') as w:raw=w.readframes(w.getnframes())
            n=len(raw)//2
            manifest['clips'].setdefault(str(p['id']),{})[voice_name]={'file':'project90-audio/'+path.name,'start':round(samples/rate,5),'end':round((samples+n)/rate,5)}
            pcm.append(raw);silence=b'\0\0'*round(rate*.35);pcm.append(silence);samples+=n+len(silence)//2
        temp=out/'pack.wav'
        with wave.open(str(temp),'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(b''.join(pcm))
        subprocess.run(['ffmpeg','-v','error','-y','-i',str(temp),'-codec:a','libmp3lame','-b:a','32k',str(path)],check=True)
        temp.unlink();print(voice_name,pack+1,path.stat().st_size,flush=True)
(out/'manifest.json').write_text(json.dumps(manifest,separators=(',',':')))
print('DONE',len(manifest['clips']),flush=True)
