Installatie
Vereisten

Node.js (versie 14 of hoger)
MySQL Server
Sakila database (MySQL sample database)

Stap-voor-stap installatie

Clone het repository
git clone <repository-url>
cd <jouw folder>

Installeer dependencies
npm install

Database Setup

Download en installeer de Sakila database van MySQL
Zorg ervoor dat MySQL server draait
Maak een database user aan met toegang tot de Sakila database


Omgevingsvariabelen (optioneel)
Maak een .env bestand in de root directory:
envDB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=sakila
DB_PORT=3306
LOG_LEVEL=debug
NODE_ENV=development

Start de applicatie
Development mode (met nodemon):
npm run dev
Production mode:
npm start
