@echo off
echo "genStart" Script will install EasyRPG's Buildscripts and Player on the current folder.
echo.

::Navigate to defined folder
pushd C:\
mkdir EasyRPG
pushd C:\EasyRPG

:: Installing Apps

where git > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git with winget...
    winget install git.git --silent
)

IF NOT EXIST "%programData%\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\Developer Command Prompt for VS 2022.lnk" (
    echo Installing Visual Studio 2022 with winget...
    winget install Microsoft.VisualStudio.2022.Community --silent --override "--wait --passive --addProductLang En-us --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"
)

::IF NOT EXIST "%ProgramFiles(x86)%\Microsoft Visual Studio\2022\BuildTools\Common7\Tools\VsDevCmd.bat" (
::    echo Installing VS2022 BuildTools with winget...
::    winget install undefined
::)

::------------------------------    


echo.

:: Clone repositories
git clone -b windows/helper https://github.com/Ghabry/easyrpg-buildscripts.git
echo.
echo.
git clone https://github.com/EasyRPG/Player.git
echo.
echo.

:: Download toolchain files that has been already built online
pushd easyrpg-buildscripts\windows
echo. | download_prebuilt.cmd

echo.
echo.

:: setup new environment variables using setx
echo. | setup_env.cmd

echo.
echo.


@echo off

echo "genFinish" Script will build EasyRPG Player as windows-x64-vs2022-debug
echo.
echo.

::pushd C:\EasyRPG
::pushd Player

@echo off

set "tempScript=%temp%\build_script_temp.bat"
(
    echo @echo off
    echo pushd C:\EasyRPG
    echo pushd Player
    echo cmake --preset windows-x64-vs2022-debug -DPLAYER_BUILD_LIBLCF=ON
    echo pushd build\windows-x64-vs2022-debug 
    echo echo .\Player\build\windows-x64-vs2022-debug is ready
    echo  start EasyRPG_Player.sln
) > "%tempScript%"

echo "%tempScript%"| call "%programData%\Microsoft\Windows\Start Menu\Programs\Visual Studio 2022\Visual Studio Tools\Developer Command Prompt for VS 2022.lnk"

del "%tempScript%"

