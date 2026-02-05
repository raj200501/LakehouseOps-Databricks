from __future__ import annotations

from pathlib import Path

INCLUDE_SUFFIXES = {'.py', '.ts', '.tsx', '.md', '.yml', '.yaml'}
EXCLUDE_PARTS = {'node_modules', 'dist', 'build', '.venv', '__pycache__'}
SKIP_FILES = {'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'}
MIN_LOC = 30000


def meaningful_lines(path: Path) -> int:
    count = 0
    for line in path.read_text(encoding='utf-8', errors='ignore').splitlines():
        stripped = line.strip()
        if stripped and not stripped.startswith('#') and not stripped.startswith('//'):
            count += 1
    return count


def should_include(path: Path) -> bool:
    if path.name in SKIP_FILES:
        return False
    if any(part in EXCLUDE_PARTS for part in path.parts):
        return False
    return path.suffix in INCLUDE_SUFFIXES


def main() -> None:
    roots = [Path('apps/api'), Path('apps/web'), Path('packages'), Path('tests'), Path('docs')]
    total = 0
    for root in roots:
        for file in root.rglob('*'):
            if file.is_file() and should_include(file):
                total += meaningful_lines(file)
    print(f'Meaningful LOC: {total}')
    if total < MIN_LOC:
        raise SystemExit(f'LOC check failed: {total} < {MIN_LOC}')


if __name__ == '__main__':
    main()
