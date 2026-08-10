from __future__ import annotations

import json
import re
import subprocess
import time
from pathlib import Path

from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
SRC_URL = "http://127.0.0.1:4173/src/index.html"
OUT_DIR = ROOT / "screenshots" / "bateria-3.8"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MOJIBAKE_RE = re.compile(
    r"�|\uFFFD|Ãƒ|Ã¢|ÃÂ|â€¢|â€“|â€”|â€œ|â€|Âº|Â°|Âª|Â ",
    re.IGNORECASE,
)

MODULES = [
    ("oficial", "Simulado Prova Oficial"),
    ("adicionais", "Questões Adicionais"),
    ("k2k3", "Cálculos K2 & K3"),
    ("exameB", "Exame B — CTFL 4.0"),
]


def start_server() -> subprocess.Popen:
    return subprocess.Popen(
        ["python", "-m", "http.server", "4173"],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def detect_issues(text: str) -> bool:
    return bool(MOJIBAKE_RE.search(text or ""))


def choose_indices(corr, opts_len: int, force_wrong: bool) -> list[int]:
    if isinstance(corr, list):
        expected = list(corr)
    else:
        expected = [int(corr)]

    if not force_wrong:
        return expected

    wrong = []
    for _ in expected:
        candidate = 0
        while candidate in expected or candidate in wrong:
            candidate += 1
            if candidate >= opts_len:
                candidate = 0
                break
        wrong.append(candidate)
    return wrong


def run_module(page, module_key: str, pass_mode: bool, capture_text_audit: bool) -> dict:
    page.goto(SRC_URL, wait_until="networkidle")
    page.click(f"button[onclick=\"start('{module_key}')\"]")
    page.wait_for_selector("#q-container")

    dataset = page.evaluate(f"window.CTFL_DB['{module_key}']")
    total = len(dataset)
    issues = []

    for idx in range(total):
        page.wait_for_selector("#q-text")
        page.wait_for_timeout(60)

        q_tag = page.locator("#q-tag").inner_text()
        q_text = page.locator("#q-text").inner_text()
        opt_locator = page.locator("#opts .opt")
        options = [opt_locator.nth(i).inner_text() for i in range(opt_locator.count())]

        if capture_text_audit:
            bucket = [q_tag, q_text, *options]
            bad_chunks = [chunk for chunk in bucket if detect_issues(chunk)]
            if bad_chunks:
                shot = OUT_DIR / f"anomalia-{module_key}-q{idx + 1:02d}.png"
                page.screenshot(path=str(shot), full_page=True)
                issues.append(
                    {
                        "module": module_key,
                        "question_index": idx + 1,
                        "question_tag": q_tag,
                        "samples": bad_chunks[:3],
                        "screenshot": str(shot),
                    }
                )

        corr = dataset[idx].get("corr", dataset[idx].get("answer"))
        selections = choose_indices(corr, len(options), force_wrong=not pass_mode)

        for option_index in selections:
            opt_locator.nth(option_index).click()
            page.wait_for_timeout(30)

        page.click("#next-btn")
        page.wait_for_timeout(40)
        page.click("#next-btn")

        if idx < total - 1:
            page.wait_for_selector("#q-text")

    page.wait_for_selector("text=Simulado Finalizado!")
    page.wait_for_timeout(200)

    status_text = page.locator("div.text-3xl").first.inner_text().strip()
    score_text = page.locator("p.text-slate-400").first.inner_text().strip()

    kind = "positivo" if pass_mode else "negativo"
    shot = OUT_DIR / f"resultado-{kind}-{module_key}.png"
    page.screenshot(path=str(shot), full_page=True)

    return {
        "module": module_key,
        "mode": kind,
        "status": status_text,
        "score_line": score_text,
        "screenshot": str(shot),
        "issues": issues,
    }


def main() -> None:
    server = start_server()
    time.sleep(1.1)
    if server.poll() is not None:
        raise RuntimeError("Falha ao iniciar servidor local.")

    report = {"runs": [], "issues": []}

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page(viewport={"width": 1600, "height": 1100})

            for module_key, _label in MODULES:
                res_ok = run_module(page, module_key, pass_mode=True, capture_text_audit=True)
                report["runs"].append(res_ok)
                report["issues"].extend(res_ok["issues"])

                res_bad = run_module(page, module_key, pass_mode=False, capture_text_audit=False)
                report["runs"].append(res_bad)

            browser.close()
    except PlaywrightTimeoutError as exc:
        report["error"] = f"Timeout Playwright: {exc}"
        raise
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()

    report_path = OUT_DIR / "relatorio-bateria.json"
    report_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(str(report_path))
    print(f"issues={len(report['issues'])}")


if __name__ == "__main__":
    main()
