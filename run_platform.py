"""Démarrage local de JobConnect, journaux dans backend/.local."""
from pathlib import Path
import os, subprocess, socket, sys, time, json
ROOT = Path(__file__).resolve().parent
LOCAL = ROOT / "backend" / ".local"
LOCAL.mkdir(exist_ok=True)
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)

def listening(port):
    with socket.socket() as sock:
        sock.settimeout(1)
        return sock.connect_ex(("127.0.0.1", port)) == 0

def listener_command(port):
    command = [
        "powershell", "-NoProfile", "-Command",
        f"$c=Get-NetTCPConnection -LocalPort {port} -State Listen -ErrorAction SilentlyContinue; "
        "if ($c) { (Get-CimInstance Win32_Process -Filter \"ProcessId = $($c.OwningProcess)\").CommandLine }",
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=False)
    return result.stdout.strip()

def ensure_project_port(port, expected):
    if not listening(port):
        return False
    command = listener_command(port).lower()
    if expected.lower() in command:
        return True
    raise RuntimeError(
        f"Le port {port} est déjà utilisé par un autre projet. "
        f"Arrêtez ce serveur avant de lancer JobConnect. Commande détectée : {command}"
    )

def run(args, cwd=ROOT):
    subprocess.run(args, cwd=cwd, check=True, creationflags=FLAGS)

def launch(args, directory, name):
    with (LOCAL / (name + ".log")).open("ab") as log:
        process = subprocess.Popen(args, cwd=directory, stdout=log, stderr=log, creationflags=FLAGS)
    print(name + " lancé (PID " + str(process.pid) + ").")
    return process.pid

python = ROOT / "backend" / "venv" / "Scripts" / "python.exe"
cluster = LOCAL / "postgres"
pgctl = Path(os.environ.get("PG_CTL", r"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"))
if cluster.exists() and not listening(55432):
    run([str(pgctl), "-D", str(cluster), "-l", str(LOCAL / "postgres.log"), "-o", "-p 55432 -h 127.0.0.1", "-w", "start"])
run([str(python), "manage.py", "migrate", "--noinput"], ROOT / "backend")
try:
    pids = json.loads((LOCAL / "services.json").read_text())
except (FileNotFoundError,ValueError):
    pids = {}
if not ensure_project_port(8000, str(ROOT / "backend")):
    pids["backend"] = launch([str(python), str(ROOT / "backend" / "manage.py"), "runserver", "127.0.0.1:8000", "--noreload"], ROOT / "backend", "backend")
if not ensure_project_port(5173, str(ROOT / "frontend")):
    pids["frontend"] = launch(["cmd.exe", "/c", "npm", "run", "dev"], ROOT / "frontend", "frontend")
if "alerts" not in pids:
    pids["alerts"] = launch([str(python), "manage.py", "send_alerts", "--loop", "60"], ROOT / "backend", "alerts")
(LOCAL / "services.json").write_text(json.dumps(pids))
for _ in range(30):
    if listening(8000) and listening(5173):
        print("JobConnect : http://127.0.0.1:5173/\nAPI : http://127.0.0.1:8000/api/health/"); break
    time.sleep(1)
else:
    print("Consultez backend/.local/backend.log et frontend.log.", file=sys.stderr)
    sys.exit(1)
