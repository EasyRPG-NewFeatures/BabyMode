@echo off
echo Start.bat will install EasyRPG's Buildscripts and Player on the current folder.
echo.

::Navigate to defined folder
pushd C:\
mkdir EasyRPG
pushd C:\EasyRPG

:: Installing Apps

where git > nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Git with winget...
    winget install git.git --silent --override
)

IF NOT EXIST "%programData%MicrosoftWindowsStart MenuProgramsVisual Studio 2022Visual Studio ToolsDeveloper Command Prompt for VS 2022.lnk" (
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
echo. | setup_env.cmd

echo.
echo.

:: setup new environment variables using setx


echo.
echo.

:: Can't proceed without opening a new prompt that has detected the changes in enviroment variables. 
:: Commands bellow will softlock this window until it's manually closed.
color 0E
echo ------------------------
echo.
echo.

echo First part of setup is completed
echo Close this window and run finish.bat

:: :x
:: pause > nul
:: goto x



@echo off
echo This script tries to update Enviroment Variables without closing and reopening CMD.
:: based on https://github.com/chocolatey/choco/blob/master/src/chocolatey.resources/redirects/RefreshEnv.cmd
:: Code generously provided by @beatcracker: https://github.com/beatcracker/detect-batch-subshell

setlocal EnableDelayedExpansion

:: Dequote path to command processor and this script path
set ScriptPath=%~0
set CmdPath=%COMSPEC:"=%

:: Get command processor filename and filename with extension
for %%c in (!CmdPath!) do (
    set CmdExeName=%%~nxc
    set CmdName=%%~nc
)

:: Get this process' PID
:: Adapted from: http://www.dostips.com/forum/viewtopic.php?p=22675#p22675
set "uid="
for /l %%i in (1 1 128) do (
    set /a "bit=!random!&1"
    set "uid=!uid!!bit!"
)

for /f "tokens=2 delims==" %%i in (
    'wmic Process WHERE "Name='!CmdExeName!' AND CommandLine LIKE '%%!uid!%%'" GET ParentProcessID /value'
) do (
    rem Get commandline of parent
    for /f "tokens=1,2,*" %%j in (
        'wmic Process WHERE "Handle='%%i'" GET CommandLine /value'
    ) do (

        rem Strip extra CR's from wmic output
        rem http://www.dostips.com/forum/viewtopic.php?t=4266
        for /f "delims=" %%x in ("%%l") do (
            rem Dequote path to batch file, if any (3rd argument)
            set ParentScriptPath=%%x
            set ParentScriptPath=!ParentScriptPath:"=!
        )

        rem Get parent process path
        for /f "tokens=2 delims==" %%y in ("%%j") do (
            rem Dequote parent path
            set ParentPath=%%y
            set ParentPath=!ParentPath:"=!

            rem Handle different invocations: C:\Windows\system32\cmd.exe , cmd.exe , cmd
            for %%p in (!CmdPath! !CmdExeName! !CmdName!) do (
                if !ParentPath!==%%p set IsCmdParent=1
            )

            rem Check if we're running in cmd.exe with /c switch and this script path as argument
            if !IsCmdParent!==1 if %%k==/c if "!ParentScriptPath!"=="%ScriptPath%" set IsExternal=1
        )
    )
)

if !IsExternal!==1 (
    echo %~nx0 does not work when run from this process. If you're in PowerShell, please 'Import-Module $env:ChocolateyInstall\helpers\chocolateyProfile.psm1' and try again.
    exit 1
)

endlocal
:: End code from @beatcracker
@echo off
::
:: RefreshEnv.cmd
::
:: Batch file to read environment variables from registry and
:: set session variables to these values.
::
:: With this batch file, there should be no need to reload command
:: environment every time you want environment changes to propagate

::echo "RefreshEnv.cmd only works from cmd.exe, please install the Chocolatey Profile to take advantage of refreshenv from PowerShell"
echo | set /p dummy="Refreshing environment variables from registry for cmd.exe. Please wait..."

goto main

:: Set one environment variable from registry key
:SetFromReg
    "%WinDir%\System32\Reg" QUERY "%~1" /v "%~2" > "%TEMP%\_envset.tmp" 2>NUL
    for /f "usebackq skip=2 tokens=2,*" %%A IN ("%TEMP%\_envset.tmp") do (
        echo/set "%~3=%%B"
    )
    goto :EOF

:: Get a list of environment variables from registry
:GetRegEnv
    "%WinDir%\System32\Reg" QUERY "%~1" > "%TEMP%\_envget.tmp"
    for /f "usebackq skip=2" %%A IN ("%TEMP%\_envget.tmp") do (
        if /I not "%%~A"=="Path" (
            call :SetFromReg "%~1" "%%~A" "%%~A"
        )
    )
    goto :EOF

:main
    echo/@echo off >"%TEMP%\_env.cmd"

    :: Slowly generating final file
    call :GetRegEnv "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" >> "%TEMP%\_env.cmd"
    call :GetRegEnv "HKCU\Environment">>"%TEMP%\_env.cmd" >> "%TEMP%\_env.cmd"

    :: Special handling for PATH - mix both User and System
    call :SetFromReg "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" Path Path_HKLM >> "%TEMP%\_env.cmd"
    call :SetFromReg "HKCU\Environment" Path Path_HKCU >> "%TEMP%\_env.cmd"

    :: Caution: do not insert space-chars before >> redirection sign
    echo/set "Path=%%Path_HKLM%%;%%Path_HKCU%%" >> "%TEMP%\_env.cmd"

    :: Cleanup
    del /f /q "%TEMP%\_envset.tmp" 2>nul
    del /f /q "%TEMP%\_envget.tmp" 2>nul

    :: capture user / architecture
    SET "OriginalUserName=%USERNAME%"
    SET "OriginalArchitecture=%PROCESSOR_ARCHITECTURE%"

    :: Set these variables
    call "%TEMP%\_env.cmd"

    :: Cleanup
    del /f /q "%TEMP%\_env.cmd" 2>nul

    :: reset user / architecture
    SET "USERNAME=%OriginalUserName%"
    SET "PROCESSOR_ARCHITECTURE=%OriginalArchitecture%"

    echo | set /p dummy="Finished."
    echo .

@echo off

echo Finish.bat will build EasyRPG Player as windows-x64-vs2022-debug mode.
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

