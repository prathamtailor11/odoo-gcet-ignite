# GitHub Setup Guide - Dayflow HRMS

## Step-by-Step Instructions to Push to GitHub

### Prerequisites
- Git installed on your computer
- GitHub account created
- Project files ready

---

## Step 1: Update .gitignore (Already Done ✅)

The `.gitignore` file has been updated to exclude:
- `.env` files (sensitive configuration)
- `node_modules` (dependencies)
- Build outputs
- Database files

---

## Step 2: Check Current Git Status

```bash
cd E:\odoo-gcet-ignite\hrms
git status
```

---

## Step 3: Add All Files to Git

```bash
# Add all files except those in .gitignore
git add .

# Verify what will be committed
git status
```

---

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Dayflow HRMS - Complete HR Management System with React frontend and Node.js backend"
```

---

## Step 5: Create GitHub Repository

### Option A: Using GitHub Website (Recommended)

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `dayflow-hrms` (or your preferred name)
   - **Description**: "Human Resource Management System with React frontend and Node.js/MongoDB backend"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Option B: Using GitHub CLI (if installed)

```bash
gh repo create dayflow-hrms --public --description "Human Resource Management System"
```

---

## Step 6: Connect Local Repository to GitHub

After creating the repository on GitHub, you'll see instructions. Use these commands:

```bash
# If you haven't set up remote yet
git remote add origin https://github.com/YOUR_USERNAME/dayflow-hrms.git

# Or if remote already exists, update it
git remote set-url origin https://github.com/YOUR_USERNAME/dayflow-hrms.git

# Verify remote
git remote -v
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 7: Push to GitHub

```bash
# Push to main branch
git push -u origin main

# If you get an error about branch name, try:
git push -u origin main --force
# (Only use --force if you're sure, as it overwrites remote history)
```

---

## Step 8: Verify Upload

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files uploaded

---

## Important Notes

### ⚠️ Security Checklist

Before pushing, make sure:
- ✅ `.env` files are in `.gitignore` (already done)
- ✅ No passwords or API keys are in code
- ✅ `backend/.env` is not committed
- ✅ Frontend `.env` is not committed

### 📝 Create .env.example Files

Create example files for others to use:

**Create `backend/.env.example`:**
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/dayflow-hrms
```

**Create `.env.example` (root):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_USE_API=true
```

---

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/dayflow-hrms.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Error: Authentication failed
- Use Personal Access Token instead of password
- Or set up SSH keys

---

## Next Steps After Pushing

1. **Add README.md** with project description
2. **Add LICENSE** file (if open source)
3. **Set up GitHub Actions** for CI/CD (optional)
4. **Add topics/tags** to repository for discoverability
5. **Create releases** for version management

---

## Quick Command Summary

```bash
# Navigate to project
cd E:\odoo-gcet-ignite\hrms

# Check status
git status

# Add files
git add .

# Commit
git commit -m "Initial commit: Dayflow HRMS"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/dayflow-hrms.git

# Push
git push -u origin main
```

---

## Need Help?

- GitHub Docs: https://docs.github.com
- Git Documentation: https://git-scm.com/doc

