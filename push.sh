#!/usr/bin/env bash

set -euo pipefail

# Resolve the project root so the script works even when launched from another directory.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# The default project and GitHub repository name is the current folder name.
# Change this line if the GitHub repository should use a different name.
PROJECT_NAME="$(basename "$ROOT_DIR")"

cd "$ROOT_DIR"

print_step() {
  printf '[push] %s\n' "$1"
}

fail() {
  printf '[push] Error: %s\n' "$1" >&2
  exit 1
}

# Detect the project stack before changing Git state. This keeps generated ignore rules
# aligned with the files and directories that are actually present in the project.
detect_stack() {
  HAS_NODE=false
  HAS_PYTHON=false
  HAS_ENV_FILE=false
  HAS_VIRTUAL_ENV=false

  if [[ -f package.json || -f package-lock.json || -d node_modules ]]; then
    HAS_NODE=true
  fi

  if [[ -f requirements.txt || -f pyproject.toml || -d __pycache__ ]]; then
    HAS_PYTHON=true
  fi

  if [[ -f .env ]]; then
    HAS_ENV_FILE=true
  fi

  if [[ -d venv || -d .venv || -d env ]]; then
    HAS_VIRTUAL_ENV=true
  fi

  printf '[push] Detected stack:'
  [[ "$HAS_NODE" == true ]] && printf ' Node.js'
  [[ "$HAS_PYTHON" == true ]] && printf ' Python'
  [[ "$HAS_ENV_FILE" == true ]] && printf ' .env'
  [[ "$HAS_VIRTUAL_ENV" == true ]] && printf ' virtual-env'
  printf '\n'
}

# Add an ignore rule only when it is missing, preserving any project-specific rules.
ensure_ignore_rule() {
  local rule="$1"

  if ! grep -Fqx -- "$rule" .gitignore; then
    printf '%s\n' "$rule" >> .gitignore
  fi
}

# Create or extend .gitignore without replacing rules that may already be useful.
ensure_gitignore() {
  print_step 'Creating/verifying .gitignore...'
  touch .gitignore

  # These rules are required for every stack and prevent credentials, local tooling,
  # generated files, and editor metadata from entering the repository.
  ensure_ignore_rule '.env'
  ensure_ignore_rule '.env.*'
  ensure_ignore_rule '!.env.example'
  ensure_ignore_rule 'venv/'
  ensure_ignore_rule '.venv/'
  ensure_ignore_rule 'env/'
  ensure_ignore_rule 'node_modules/'
  ensure_ignore_rule '__pycache__/'
  ensure_ignore_rule '*.pyc'
  ensure_ignore_rule 'logs/'
  ensure_ignore_rule '.DS_Store'
  ensure_ignore_rule '.vscode/'
  ensure_ignore_rule '.idea/'

  # Add generated directories specific to the detected stack.
  if [[ "$HAS_NODE" == true ]]; then
    ensure_ignore_rule 'dist/'
    ensure_ignore_rule 'build/'
    ensure_ignore_rule 'coverage/'
  fi

  if [[ "$HAS_PYTHON" == true ]]; then
    ensure_ignore_rule '.pytest_cache/'
    ensure_ignore_rule '.mypy_cache/'
  fi
}

# Check the existing GitHub CLI login. Authentication is intentionally delegated to gh;
# this script never stores, requests, or prints tokens and passwords.
require_gh_auth() {
  if ! command -v gh >/dev/null 2>&1; then
    fail 'GitHub CLI is not installed. Install gh, then run gh auth login.'
  fi

  if ! gh auth status >/dev/null 2>&1; then
    fail 'GitHub CLI is not logged in. Run gh auth login, then run this script again.'
  fi
}

# Reuse an existing repository when possible. Only a first run without .git may create
# a new private repository; later runs require an existing origin instead.
ensure_origin() {
  if git remote get-url origin >/dev/null 2>&1; then
    return
  fi

  require_gh_auth

  local existing_url
  existing_url="$(gh repo view "$PROJECT_NAME" --json url -q .url 2>/dev/null || true)"

  if [[ -n "$existing_url" ]]; then
    print_step "Adding existing GitHub repository as origin..."
    git remote add origin "$existing_url"
    return
  fi

  if [[ "$FIRST_RUN" != true ]]; then
    fail "No origin is configured and GitHub repository '$PROJECT_NAME' was not found."
  fi

  print_step "Creating private GitHub repository '$PROJECT_NAME'..."
  gh repo create "$PROJECT_NAME" --private --source=. --remote=origin
}

detect_stack

FIRST_RUN=false
if [[ ! -e .git ]]; then
  FIRST_RUN=true
  print_step 'Initialising Git with main as the default branch...'
  git init -b main
else
  current_branch="$(git branch --show-current)"
  if [[ "$current_branch" != 'main' ]]; then
    fail "The current branch is '$current_branch'. Check out main before running push.sh."
  fi
fi

ensure_gitignore

if [[ "$FIRST_RUN" == true ]]; then
  print_step 'Checking GitHub CLI authentication...'
  require_gh_auth
fi

ensure_origin

print_step 'Adding all changes...'
git add -A

# A clean tree is a normal repeat-run outcome. Do not create an empty commit.
if git diff --cached --quiet; then
  printf '%s\n' 'Nothing to commit'
  exit 0
fi

# Number the commit from the current local history, then append an optional custom message.
commit_count="$(git rev-list --count HEAD 2>/dev/null || printf '0')"
commit_number=$((commit_count + 1))
timestamp="$(date '+%Y-%m-%d %H:%M')"
commit_message="Commit #${commit_number} - ${timestamp}"
if [[ -n "${1:-}" ]]; then
  commit_message+=" - $1"
fi

print_step 'Committing changes...'
git commit -m "$commit_message"

# Use an upstream-setting push only for the first push of this main branch.
print_step 'Pushing to origin/main...'
if git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  git push
else
  git push -u origin main
fi

require_gh_auth
short_hash="$(git rev-parse --short HEAD)"
last_message="$(git log -1 --pretty=%s)"
repository_url="$(gh repo view --json url -q .url)"

printf 'Commit: %s\n' "$short_hash"
printf 'Message: %s\n' "$last_message"
printf 'Repository: %s\n' "$repository_url"
