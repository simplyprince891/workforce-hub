@echo off
echo Preparing to push WorkForce Hub to GitHub...
cd C:\Users\abdur.ahmed\Desktop\Proj

REM Initialize if not already
if not exist .git (
    git init
)

REM Set identity
git config user.name "simplyprince891"
git config user.email "simplyprince891@gmail.com"

REM Add and commit
git add .
git commit -m "UI/UX Overhaul & Backend Stabilization:
- Premium Glassmorphism UI for Login/Register
- Modernized Dashboard & Navigation
- Robust Idempotent Data Seeding (PostgreSQL compatible)
- Fixed RBAC Hierarchy & Attendance Logic
- Enhanced Performance & Payroll Calculations"

REM Branch and Remote
git branch -M main
git remote remove origin >nul 2>&1
git remote add origin https://github.com/simplyprince891/workforce-hub.git

echo.
echo Please run the following command to complete the push:
echo git push -u origin main
echo.
pause