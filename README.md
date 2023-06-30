# Typescript2023Intro
Mein Typescript projekt mit react frontend and nodejs backend. 

Github Repo: https://github.com/Saftbear/Typescript2023Intro

Es muss FFmpeg installiert sein, damit die Videos hochgeladen werden können. 
Installieren auf Linux:
1. sudo apt-get update
2. sudo apt-get install ffmpeg
3. verify: ffmpeg -version

(Ich habe es mit einer Ubunut VM ausprobiert und es musste nichts weiter gemacht werden)
Source: https://www.geeksforgeeks.org/how-to-install-ffmpeg-in-linux/
Source1, andere Linux Systeme und Windows: https://www.hostinger.com/tutorials/how-to-install-ffmpeg


Mac installation mit homebrew: 
brew install ffmpeg

Starten des Nodejs server:
1. Navigieren in server folder.
2. (npm install)
3. npm start

Bei start wird automatisch eine SQLite Datenbank erstellt. 
(Wenn dies nicht passiert, habe ich eine Datenbank hochgeladen in server unter namen: myYoutube_red.sqlite. Diese bitte umbennen in myYoutube.sqlite.)



Link: http://localhost:3001

Starten des React server:
1. Navigieren in client folder
2. (npm install)
3. npm start

Link: http://localhost:3000

Hinweis: Beide Server müssen gleichzeitig laufen. 

Wenn der Nutzer bei direkt nach initialisieren des Projektes/neustarten des Projektes eingeloggt sein sollte, müsste man sich ausloggen.
Es kann ein Nutzer in Register erstellt werden. Dann muss sich in Login eingeloggt werden. Es können Videos angesehen werden, wenn der nutzer eingeloggt ist, aber diese können nicht bearbeitet werden ohne sich einzuloggen.
Es können Videos editiert werden, Thumbnails hochgeladen werden oder die vorgefertigten genutzt werden. 

Testen:
Starten des Nodejs server:
1. Navigieren in server folder.
2. (npm install)
3. npx jest

Starten des react server:
1. Navigieren in server folder.
2. (npm install)
3. npx jest


Für den einen End-to-End test:
1. Start client 
2. Start backend-server
3. Run cypress: npx cypress run
