"""Arrête uniquement les processus enregistrés par le lanceur JobConnect."""
from pathlib import Path
import json,subprocess
root=Path(__file__).resolve().parent
path=root/"backend"/".local"/"services.json"
if path.exists():
    for name,pid in json.loads(path.read_text()).items():
        if isinstance(pid,int) and pid>0:
            subprocess.run(["taskkill","/PID",str(pid),"/T","/F"],creationflags=getattr(subprocess,"CREATE_NO_WINDOW",0),check=False)
            print(name+" arrêté.")
    path.write_text("{}")
print("Les données PostgreSQL sont conservées.")
