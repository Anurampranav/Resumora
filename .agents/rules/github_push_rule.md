# Master GitHub Push + Contribution Verification Rule

Whenever modifying Resumora and pushing changes to GitHub, all commits MUST be properly attributed to:
- **GitHub account**: `Anurampranav`
- **Repository**: `https://github.com/Anurampranav/Resumora.git`
- **Branch**: `main`
- **Git User Name**: `Anuram Pranav`
- **Git User Email**: `anurampranav07@gmail.com`

---

## 1. BEFORE EVERY COMMIT

Verify Git configuration:
```bash
git config user.name
git config user.email
```
If not correct, set repository and global identity:
```bash
git config user.name "Anuram Pranav"
git config user.email "anurampranav07@gmail.com"
git config --global user.name "Anuram Pranav"
git config --global user.email "anurampranav07@gmail.com"
```

---

## 2. VERIFY REPOSITORY AND BRANCH

```bash
git remote -v
```
MUST point to `https://github.com/Anurampranav/Resumora.git`.
If not: `git remote set-url origin https://github.com/Anurampranav/Resumora.git`

```bash
git branch --show-current
```
MUST be `main`.
If not: `git switch main`

*DO NOT run git init or create another repository.*

---

## 3. BEFORE COMMITTING

Run `git status` and `git diff --stat`.
Inspect changes carefully.

**NEVER commit:**
- `.env`, `.env.local`
- API keys / Gemini API keys / Clerk secret keys / Supabase service role keys
- Database passwords
- `node_modules`
- Python virtual environments (`venv`, `.venv`)
- Uploaded resumes, user data, temporary or generated private files.

Ensure `.gitignore` protects all sensitive files.

---

## 4. CREATE COMMIT

```bash
git add .
git commit -m "<descriptive message>"
```
*Do NOT create empty or meaningless commits.*

---

## 5. VERIFY COMMIT BEFORE PUSHING

```bash
git log -1 --format=fuller
git log -1 --format="%H%n%an%n%ae%n%ad%n%s"
```
Output MUST contain:
- Author: `Anuram Pranav`
- Email: `anurampranav07@gmail.com`

If author/email is anything else, **STOP immediately, DO NOT PUSH**, fix git identity and recreate the commit.

---

## 6. PUSH

Only after all verification passes:
```bash
git push origin main
```
*DO NOT use `git push --force` unless explicitly requested by the user.*

---

## 7. VERIFY REMOTE COMMIT

```bash
git fetch origin
git log origin/main -1 --format="%H%n%an%n%ae%n%ad%n%s"
```
Verify:
1. Remote commit author is `Anuram Pranav` (`anurampranav07@gmail.com`).
2. `git rev-parse HEAD` matches `git rev-parse origin/main`.

---

## 8. FINAL REPORT FORMAT

After every successful push, output:

```
GITHUB PUSH VERIFICATION

Repository:
Anurampranav/Resumora

Branch:
main

Commit:
[commit hash]

Author:
Anuram Pranav

Email:
anurampranav07@gmail.com

Remote verified:
YES

Local HEAD:
[hash]

origin/main:
[hash]

Hashes match:
YES

Push:
SUCCESS
```
