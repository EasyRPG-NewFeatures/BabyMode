@echo off
echo "genStart" Script will install EasyRPG's Buildscripts and Player on the current folder.
echo.

set "updateEnvVars=%cd%\updateEnvVariables.bat"

::Navigate to defined folder
pushd F:\GitHub Repos\PlayerRepo

set "current_dir=%cd%"

:: Installing Apps

where git > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git with winget...
    winget install git.git --silent
    call "%updateEnvVars%"
)

IF NOT EXIST "%programData%\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\Developer Command Prompt for VS 2022.lnk" (
    echo Installing Visual Studio 2022 with winget...
    winget install Microsoft.VisualStudio.2022.Community --silent --override "--wait --passive --addProductLang En-us --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"
    call "%updateEnvVars%"
)

::------------------------------    


echo.

:: Clone repositories
git clone -b master https://github.com/EasyRPG/Player.git MyPlayer
echo.
echo.
git clone undefined
echo.
echo.

:: Download liblcf files that has been already built online
pushd buildScripts\windows


echo.
echo.

:: setup new environment variables using setx

call "%updateEnvVars%"
echo.
echo.


@echo off

echo "genFinish" Script will build EasyRPG Player as windows-x64-vs2022-debug
echo.
echo.

set "projectFilePath="%cd%\EasyRPG_Player_exe.vcxproj.user"" 
set "newArguments=--test-play --project-path "C:\EasyRPG""


set "tempScript=%temp%\build_script_temp.bat"
(
    echo @echo off
    echo pushd F:\GitHub Repos\PlayerRepo
    echo pushd MyPlayer
    echo cmake --preset windows-x64-vs2022-debug -DPLAYER_BUILD_LIBLCF=ON
    echo pushd build\windows-x64-vs2022-debug 
    echo  start EasyRPG_Player.sln


) > "%tempScript%"
echo "%tempScript%"| call "%programData%\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\Developer Command Prompt for VS 2022.lnk"

::powershell -Command "(Get-Content '%projectFilePath%') -replace '(<LocalDebuggerCommandArguments>).*?(</LocalDebuggerCommandArguments>)', '$1%newArguments%$2' | Set-Content '%projectFilePath%'"
del "%tempScript%"
echo.
echo.
echo --------------------
echo.
echo.
echo Install finished. Close this window PLS.

:loop
pause >nul
goto loop


