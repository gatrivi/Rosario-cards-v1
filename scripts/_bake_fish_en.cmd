@echo off
title CatTS JOB ? Fish EN Liber pack ? CLOSE = STOP
color 0B
cd /d C:\zengatrivi\REACTJS\rosario-cards-v1
echo Fish EN Liber bake ? public\voice\en + catts static\fish\devotions\en
echo Log: scripts\fish-en-bake.log
E:\zengatrivi-drive-e\catts\.venv\Scripts\python.exe scripts\bake_fish_en_missing.py
echo EXIT=%ERRORLEVEL%
pause
