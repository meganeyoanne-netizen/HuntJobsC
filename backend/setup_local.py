"""Configure une base PostgreSQL locale isolée sans toucher aux bases existantes."""
from pathlib import Path
import secrets
import subprocess
import os
base = Path(__file__).resolve().parent
local = base / ".local"
local.mkdir(exist_ok=True)
binary = Path(os.environ.get("POSTGRES_BIN", "C:/Program Files/PostgreSQL/18/bin"))
data = local / "postgres"
env = base / ".env"
if env.exists() and env.read_text().strip():
    print("Configuration .env existante conservée. Renseignez vos propres paramètres.")
    raise SystemExit(0)
pwfile = local / "pg-password"
password = pwfile.read_text() if pwfile.exists() else secrets.token_urlsafe(32)
pwfile.write_text(password)
if not data.exists():
    subprocess.run([str(binary / "initdb.exe"), "-D", str(data), "-U", "huntjobs", "-A", "scram-sha-256", "--pwfile", str(pwfile), "--encoding=UTF8"], check=True)
subprocess.run([str(binary / "pg_ctl.exe"), "-D", str(data), "-l", str(local / "postgres.log"), "-o", "-p 55432 -h 127.0.0.1", "start"], check=True)
process_env = {**os.environ, "PGPASSWORD": password}
subprocess.run([str(binary / "createdb.exe"), "-h", "127.0.0.1", "-p", "55432", "-U", "huntjobs", "huntjobs"], env=process_env, check=True)
env.write_text("SECRET_KEY=" + secrets.token_urlsafe(64) + "\nDEBUG=True\nDB_ENGINE=postgresql\nDB_NAME=huntjobs\nDB_USER=huntjobs\nDB_PASSWORD=" + password + "\nDB_HOST=127.0.0.1\nDB_PORT=55432\nGROQ_API_KEY=\nGROQ_MODEL=openai/gpt-oss-120b\n")
pwfile.unlink()
print("PostgreSQL isolé prêt sur 127.0.0.1:55432. Secrets enregistrés uniquement dans .env.")
