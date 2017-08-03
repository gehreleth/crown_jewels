call gradle clean
call gradle war
del %CATALINA_BASE%\webapps\mycunei.war
del /s /f /q %CATALINA_BASE%\webapps\mycunei\*.*
for /f %%f in ('dir /ad /b %CATALINA_BASE%\webapps\mycunei') do rd /s /q c:\share\%%f
copy .\build\libs\mycunei.war %CATALINA_BASE%\webapps
%CATALINA_BASE%\bin\catalina.bat jpda start
