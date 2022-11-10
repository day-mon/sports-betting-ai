# All files pertaining to the frontend portion of the application stack.
This is the frontend client of the Sports Betting AI. This is where all user interactions will occur.

# Installation

## Option 1 (Docker)
### Dependencies
* PHP 8.1
    * php8.1-zip
    * php8.1-gd
    * php8.1-curl
    * php8.1-xml
* Docker (WSL2 if on Windows)

### Step 1
* From the Website directory
* `composer install`
* This will install all of the dependencies to start running the Docker container

### Step 2
* Now to run the docker-compose.yml file to bring up the server
* `./vendor/bin/sail up`
* This will start all the services and a webserver on `localhost:80`

### Additional Help
https://laravel.com/docs/9.x/sail

## Option 2 (Standalone)
### Dependencies
* PHP 8.1
    * php8.1-zip
    * php8.1-gd
    * php8.1-curl
    * php8.1-xml
* Composer (Package Manager)
* MySql
* Webserver (Laragon, XAMPP, Valet, Homestead, Other...)
    * Optionally just for development `php artisan serve` will also work

### Step 1
* From the Website directory
* `composer install`
* This will install all of the dependencies for the application

### Step 2
* Install NPM dependencies.
* `npm install`

## Steps are the same for both from here.

### Step 3
* Compile assets
* Non-docker - `npm run dev` or `npm run prod`
* Docker - `./vendor/bin/sail npm run dev`

