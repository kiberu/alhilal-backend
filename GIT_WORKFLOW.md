# Git Workflow - Alhilal Project

This document outlines the Git branching strategy, workflow, and best practices for the Alhilal project.

## 📊 Branching Strategy

We follow a **Git Flow** inspired strategy with the following branches:

### Main Branches

#### `main` (Production)
- **Purpose**: Production-ready code
- **Protected**: Yes (requires pull request + review)
- **Deploys to**: Production environment
- **Merge from**: `release/*` branches only
- **Never commit directly**

#### `develop` (Integration)
- **Purpose**: Integration branch for features
- **Protected**: Yes (requires pull request)
- **Deploys to**: Staging environment
- **Merge from**: `feature/*`, `bugfix/*` branches
- **Source for**: `release/*` branches

### Supporting Branches

#### `feature/*` (New Features)
- **Purpose**: Develop new features
- **Naming**: `feature/feature-name` (e.g., `feature/visa-approval`)
- **Branch from**: `develop`
- **Merge into**: `develop`
- **Lifetime**: Until feature complete
- **Delete after**: Merge to develop

#### `bugfix/*` (Bug Fixes)
- **Purpose**: Fix bugs in develop
- **Naming**: `bugfix/bug-description` (e.g., `bugfix/booking-validation`)
- **Branch from**: `develop`
- **Merge into**: `develop`
- **Lifetime**: Until bug fixed
- **Delete after**: Merge to develop

#### `hotfix/*` (Production Fixes)
- **Purpose**: Emergency fixes for production
- **Naming**: `hotfix/issue-description` (e.g., `hotfix/otp-expiry`)
- **Branch from**: `main`
- **Merge into**: `main` AND `develop`
- **Lifetime**: Until fix deployed
- **Delete after**: Merge complete

#### `release/*` (Release Preparation)
- **Purpose**: Prepare for production release
- **Naming**: `release/vX.Y.Z` (e.g., `release/v1.0.0`)
- **Branch from**: `develop`
- **Merge into**: `main` AND `develop`
- **Activities**: Version bump, final testing, bug fixes
- **Delete after**: Merge complete

## 🚀 Workflow

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd alhilal

# Check current branch
git branch

# You should see: main (or master)

# Create develop branch
git checkout -b develop

# Push develop to remote
git push -u origin develop
```

### Feature Development

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/trip-duplication

# 3. Work on feature
# ... make changes ...

# 4. Commit changes
git add .
git commit -m "feat: add trip duplication functionality"

# 5. Push to remote
git push -u origin feature/trip-duplication

# 6. Create Pull Request (via GitHub/GitLab)
# - Base: develop
# - Compare: feature/trip-duplication
# - Get review and approval

# 7. Merge to develop (via PR)
# - Squash and merge recommended
# - Delete feature branch after merge

# 8. Pull latest develop
git checkout develop
git pull origin develop

# 9. Delete local feature branch
git branch -d feature/trip-duplication
```

### Bug Fix

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create bugfix branch
git checkout -b bugfix/passport-validation

# 3. Fix bug
# ... make changes ...

# 4. Commit with test
git add .
git commit -m "fix: correct passport expiry validation"

# 5. Push and create PR (same as feature)
git push -u origin bugfix/passport-validation
```

### Hotfix (Production Emergency)

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/otp-rate-limit

# 3. Fix issue
# ... make changes ...

# 4. Commit fix
git add .
git commit -m "hotfix: increase OTP rate limit to 10/hour"

# 5. Push to remote
git push -u origin hotfix/otp-rate-limit

# 6. Create PR to main
# - Get emergency review
# - Deploy to production

# 7. Also merge to develop
git checkout develop
git merge hotfix/otp-rate-limit
git push origin develop

# 8. Delete hotfix branch
git branch -d hotfix/otp-rate-limit
git push origin --delete hotfix/otp-rate-limit
```

### Release Process

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create release branch
git checkout -b release/v1.0.0

# 3. Update version numbers
# - backend/alhilal/__init__.py: __version__ = '1.0.0'
# - Update CHANGELOG.md

# 4. Final testing
# - Run all tests
# - Manual QA
# - Bug fixes (commit to release branch)

# 5. Merge to main
git checkout main
git merge release/v1.0.0
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin main --tags

# 6. Merge back to develop
git checkout develop
git merge release/v1.0.0
git push origin develop

# 7. Delete release branch
git branch -d release/v1.0.0
git push origin --delete release/v1.0.0

# 8. Deploy to production
```

## 📝 Commit Message Convention

We follow **Conventional Commits** specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc.
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(api): add trip essentials endpoint"

# Bug fix
git commit -m "fix(booking): validate passport expiry against trip dates"

# Documentation
git commit -m "docs: add API authentication guide"

# Multiple lines
git commit -m "feat(admin): add trip duplication action

- Duplicates trip with all packages
- Copies flights, hotels, itinerary
- Does not copy bookings or visas

Closes #123"

# Breaking change
git commit -m "feat(api)!: change OTP expiry to 10 minutes

BREAKING CHANGE: OTP codes now expire in 10 minutes instead of 5"
```

### Scopes

Common scopes in our project:
- `api` - REST API changes
- `admin` - Django Admin changes
- `auth` - Authentication system
- `booking` - Booking module
- `trip` - Trip management
- `visa` - Visa processing
- `test` - Test changes
- `docs` - Documentation
- `ci` - CI/CD pipeline

## 🔄 Pull Request Process

### Creating PR

1. **Push branch to remote**
   ```bash
   git push -u origin feature/my-feature
   ```

2. **Create PR via GitHub/GitLab**
   - Title: Clear, descriptive
   - Description: What, why, how
   - Link related issues
   - Add screenshots (if UI changes)

3. **PR Template** (create `.github/pull_request_template.md`):
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings
   ```

### Review Process

1. **Self-review**
   - Read your own diff
   - Check for debug code
   - Verify tests pass

2. **Request review**
   - At least 1 reviewer
   - Wait for approval

3. **Address feedback**
   - Make requested changes
   - Push to same branch
   - Request re-review

4. **Merge**
   - Squash and merge (recommended)
   - Delete branch after merge

## 🏷️ Tagging & Versioning

### Semantic Versioning

We use **SemVer**: `MAJOR.MINOR.PATCH`

- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes

### Creating Tags

```bash
# Lightweight tag
git tag v1.0.0

# Annotated tag (recommended)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags
git push origin v1.0.0
# or push all tags
git push origin --tags

# List tags
git tag

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### Version Management

Update version in:
1. `backend/alhilal/__init__.py`:
   ```python
   __version__ = '1.0.0'
   ```

2. `CHANGELOG.md`:
   ```markdown
   ## [1.0.0] - 2025-01-20
   ### Added
   - Initial release
   - OTP authentication
   - Complete REST API
   ```

## 🔒 Branch Protection Rules

### `main` Branch

- **Require pull request reviews**: 1 approval
- **Require status checks**: All tests must pass
- **Require up-to-date branches**: Yes
- **Include administrators**: Yes
- **Restrict pushes**: No direct commits
- **Restrict force pushes**: Disabled

### `develop` Branch

- **Require pull request reviews**: 1 approval
- **Require status checks**: All tests must pass
- **Allow force pushes**: No
- **Restrict deletions**: Yes

## 🛠️ Useful Git Commands

### Keeping Branches Updated

```bash
# Update local develop
git checkout develop
git pull origin develop

# Rebase feature on latest develop
git checkout feature/my-feature
git rebase develop

# If conflicts, resolve and continue
git add .
git rebase --continue

# Force push after rebase
git push --force-with-lease origin feature/my-feature
```

### Stashing Changes

```bash
# Save current work
git stash save "WIP: working on feature"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}
```

### Undoing Changes

```bash
# Discard local changes
git checkout -- <file>

# Unstage file
git reset HEAD <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Revert commit (create new commit)
git revert <commit-hash>
```

### Viewing History

```bash
# View commit log
git log --oneline --graph --all

# View changes in commit
git show <commit-hash>

# View file history
git log -p <file>

# Find who changed what
git blame <file>
```

## 📋 Checklist

### Before Committing

- [ ] Code follows style guide
- [ ] All tests pass (`make test`)
- [ ] No debug/console statements
- [ ] Documentation updated
- [ ] Commit message follows convention

### Before Creating PR

- [ ] Branch up-to-date with develop
- [ ] All commits follow convention
- [ ] PR description complete
- [ ] Tests added for new features
- [ ] Screenshots added (if UI changes)

### Before Merging

- [ ] All review comments addressed
- [ ] CI/CD pipeline passes
- [ ] No merge conflicts
- [ ] At least 1 approval

### Before Releasing

- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] All tests pass
- [ ] Manual testing completed
- [ ] Documentation reviewed

## 🚨 Emergency Procedures

### Rollback Production

```bash
# 1. Find previous good tag
git tag

# 2. Create hotfix from previous version
git checkout v1.0.0
git checkout -b hotfix/rollback-v1.0.1

# 3. Merge to main
git checkout main
git merge hotfix/rollback-v1.0.1

# 4. Deploy
```

### Fix Broken Develop

```bash
# 1. Find last good commit
git log develop

# 2. Reset develop to good commit
git checkout develop
git reset --hard <good-commit-hash>

# 3. Force push (use with caution!)
git push --force origin develop

# 4. Notify team
```

## 📚 Resources

- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Pro Git Book](https://git-scm.com/book/en/v2)

---

## 🎯 Current Branch Structure

After initial setup:

```
main (production)
└── develop (staging)
    ├── feature/* (features in progress)
    ├── bugfix/* (bug fixes)
    └── release/* (preparing releases)

hotfix/* (emergency fixes - branch from main)
```

**Always work on feature branches, never commit directly to main or develop!**

