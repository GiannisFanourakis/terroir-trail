"""
TerroirTrail Autonomous Agent Workforce CLI
============================================
Coordinates and monitors the specialized AI agents for TerroirTrail:
- Terra: Operations Lead & Editorial Director (Gemini Pro)
- Clio: Content Creator & Visual Artisan (Gemini Flash)
- Aletheia: Fact-Checking & Brand Auditor (Gemini Pro)
- Ariadne: Cartographer & Producer Verification (Gemini Pro)
- Daedalus: Software Engineer & Architect (Gemini Pro)
- Talos: CI/CD & Security Sentinel (Gemini Flash)
- Hermes: Inbound Communications & Triage (Gemini Flash-Lite)
- Keryx: Omnichannel Social Publisher (Gemini Flash-Lite)
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
AGENTS_DIR = REPO_ROOT / ".agents"
SCHEDULED_PIPELINE = Path(r"C:\Users\giana\Desktop\TerroirTrail\TerroirTrail Social\Scheduled_Pipeline")

WORKFORCE = {
    "terra": {
        "title": "Τέρρα (Terra)",
        "role": "Operations Manager & Editorial Director",
        "model": "Gemini Pro",
        "archetype": "The Earth Mother / Orchestrator",
        "spec": AGENTS_DIR / "terra.md",
    },
    "clio": {
        "title": "Κλειώ (Clio)",
        "role": "Social Media Content Creator & Visual Artisan",
        "model": "Gemini Flash",
        "archetype": "Muse of History & Storytelling",
        "spec": AGENTS_DIR / "clio.md",
    },
    "aletheia": {
        "title": "Ἀλήθεια (Aletheia)",
        "role": "Fact-Checker & Brand Quality Auditor",
        "model": "Gemini Pro",
        "archetype": "Unvarnished Truth Guardian",
        "spec": AGENTS_DIR / "aletheia.md",
    },
    "ariadne": {
        "title": "Ἀριάδνη (Ariadne)",
        "role": "Producer Verification & Cartographer",
        "model": "Gemini Pro",
        "archetype": "The Labyrinth Thread / Navigator",
        "spec": AGENTS_DIR / "ariadne.md",
    },
    "daedalus": {
        "title": "Δαίδαλος (Daedalus)",
        "role": "Software Engineer & Architect",
        "model": "Gemini Pro",
        "archetype": "Master Craftsman & Builder",
        "spec": AGENTS_DIR / "daedalus.md",
    },
    "talos": {
        "title": "Τάλως (Talos)",
        "role": "CI/CD, QA & Security Sentinel",
        "model": "Gemini Flash",
        "archetype": "Bronze Automaton Defender",
        "spec": AGENTS_DIR / "talos.md",
    },
    "hermes": {
        "title": "Ἑρμῆς (Hermes)",
        "role": "Inbound Communications & Inbox Triage",
        "model": "Gemini Flash-Lite",
        "archetype": "The Sacred Messenger",
        "spec": AGENTS_DIR / "hermes.md",
    },
    "keryx": {
        "title": "Κῆρυξ (Keryx)",
        "role": "Unified Omnichannel Social Publisher",
        "model": "Gemini Flash-Lite",
        "archetype": "Public Herald (Red Button)",
        "spec": AGENTS_DIR / "keryx.md",
    },
}

def print_status():
    print("\n" + "=" * 90)
    print("                     TERROIRTRAIL AGENT WORKFORCE STATUS")
    print("=" * 90)
    header = f"{'Agent':<12} | {'Role':<42} | {'Model':<18} | {'Spec Status'}"
    print(header)
    print("-" * 90)
    for name, info in WORKFORCE.items():
        spec_exists = "Active (Registered)" if info["spec"].exists() else "Missing"
        print(f"{name:<12} | {info['role']:<42} | {info['model']:<18} | {spec_exists}")
    print("=" * 90)
    print("\nOperational Policy: 'Never advertise producers without them paying'")
    print("Publishing Gate: All external publishing requires explicit sign-off from Giannis.\n")

def run_agent(agent_name: str, prompt: str, interactive: bool = False):
    if agent_name not in WORKFORCE:
        print(f"[Error] Unknown agent '{agent_name}'. Available: {list(WORKFORCE.keys())}")
        sys.exit(1)

    print(f"\n[Workforce] Invoking {WORKFORCE[agent_name]['title']} ({WORKFORCE[agent_name]['model']})...")
    
    cmd = ["agy", "--agent", agent_name]
    if interactive:
        cmd.extend(["-i", prompt])
    else:
        cmd.extend(["-p", prompt])

    try:
        subprocess.run(cmd, cwd=str(REPO_ROOT), check=True)
    except FileNotFoundError:
        print("[Error] 'agy' executable not found on PATH. Ensure Antigravity CLI is installed.")
    except subprocess.CalledProcessError as e:
        print(f"[Error] Agent execution failed with exit code {e.returncode}")

def run_talos_qa():
    print("\n[Talos] Initiating automated repository validation gate...")
    try:
        subprocess.run(["npm", "run", "check"], cwd=str(REPO_ROOT), check=True, shell=True)
        print("\n[Talos] Repository check passed with 0 errors. Perimeter secure.")
    except subprocess.CalledProcessError as e:
        print(f"\n[Talos] Validation FAILED (exit code {e.returncode}). Handing off to Daedalus.")
        sys.exit(e.returncode)

def run_cloud_status():
    print("\n[Cloud Bridge] Checking 24/7 Cloud Workforce Status...")
    try:
        res = subprocess.run(
            ["gh", "run", "list", "--workflow", "Autonomous Editorial Pipeline (Clio + Aletheia)", "--limit", "3", "--json", "status,conclusion,createdAt,url"],
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=True
        )
        import json
        runs = json.loads(res.stdout)
        if not runs:
            print("  No recent cloud runs found.")
            return
        print("-" * 80)
        for r in runs:
            status = r.get("status")
            conclusion = r.get("conclusion") or "in progress"
            created = r.get("createdAt", "")[:16].replace("T", " ")
            url = r.get("url", "")
            print(f"  Cloud Run: {created} UTC | State: {status} ({conclusion})")
            print(f"  Link: {url}")
        print("-" * 80)
    except FileNotFoundError:
        print("  [Note] 'gh' CLI not found. View runs at https://github.com/GiannisFanourakis/terroir-trail/actions")
    except Exception as e:
        print(f"  [Error] Could not fetch cloud status: {e}")

def run_cloud_sync():
    print("\n[Cloud Bridge] Synchronizing local workspace with Cloud Workforce...")
    try:
        # 1. Fetch git updates
        print("  1. Fetching latest remote commits...")
        subprocess.run(["git", "fetch", "origin", "main"], cwd=str(REPO_ROOT), check=True)
        # 2. Download latest artifacts if available
        print("  2. Fetching latest cloud-rendered editorial packages...")
        staging_dir = REPO_ROOT / "staging" / "cloud_downloads"
        staging_dir.mkdir(parents=True, exist_ok=True)
        subprocess.run(["gh", "run", "download", "--name", "verified-editorial-packages", "--dir", str(staging_dir)], cwd=str(REPO_ROOT))
        print(f"  Synced successfully! Staged artifacts saved in: {staging_dir}")
    except Exception as e:
        print(f"  [Note] Sync completed with note: {e}")

def main():
    parser = argparse.ArgumentParser(description="TerroirTrail Autonomous Agent Workforce")
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # status
    subparsers.add_parser("status", help="Display all 8 agents and operational readiness")

    # cloud-status
    subparsers.add_parser("cloud-status", help="Display latest 24/7 cloud workflow runs")

    # cloud-sync
    subparsers.add_parser("cloud-sync", help="Synchronize local workspace with cloud artifacts")

    # adk-web
    subparsers.add_parser("adk-web", help="Start Google ADK Web UI playground")

    # adk-run
    adk_run_parser = subparsers.add_parser("adk-run", help="Run Google ADK multi-agent in terminal")
    adk_run_parser.add_argument("query", nargs="?", default="", help="Query to run")

    # invoke
    invoke_parser = subparsers.add_parser("invoke", help="Invoke a specific agent")
    invoke_parser.add_argument("agent", choices=list(WORKFORCE.keys()), help="Agent name")
    invoke_parser.add_argument("prompt", help="Prompt or task for the agent")
    invoke_parser.add_argument("-i", "--interactive", action="store_true", help="Launch interactive session")

    # qa
    subparsers.add_parser("qa", help="Run Talos CI/CD validation gate (npm run check)")

    # audit
    audit_parser = subparsers.add_parser("audit", help="Run Aletheia's audit on a scheduled week")
    audit_parser.add_argument("--week", type=int, required=True, help="Week number (e.g. 43, 44, 45)")

    args = parser.parse_args()

    if args.command == "status" or not args.command:
        print_status()
    elif args.command == "adk-web":
        print("\n[Google ADK] Starting Web UI for TerroirTrail multi-agent workforce...")
        subprocess.run(["adk", "web", "workforce/terroir_adk"], cwd=str(REPO_ROOT))
    elif args.command == "adk-run":
        cmd = ["adk", "run", "workforce/terroir_adk"]
        if args.query:
            cmd.append(args.query)
        subprocess.run(cmd, cwd=str(REPO_ROOT))
    elif args.command == "cloud-status":
        run_cloud_status()
    elif args.command == "cloud-sync":
        run_cloud_sync()
    elif args.command == "invoke":
        run_agent(args.agent, args.prompt, args.interactive)
    elif args.command == "qa":
        run_talos_qa()
    elif args.command == "audit":
        week_dirs = list(SCHEDULED_PIPELINE.glob(f"*Week_{args.week}*"))
        if not week_dirs:
            print(f"[Error] Week {args.week} directory not found in {SCHEDULED_PIPELINE}")
            sys.exit(1)
        week_dir = week_dirs[0]
        prompt = (
            f"Audit the staged editorial package for Week {args.week} at '{week_dir}'. "
            f"Check slide dimensions, contrast, text bounds, source attribution, and verify "
            f"compliance with the 'Never advertise producers without paying' commercial invariant."
        )
        run_agent("aletheia", prompt)

if __name__ == "__main__":
    main()
