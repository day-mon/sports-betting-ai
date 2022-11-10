# All files pertaining to the frontend portion of the application stack.
This is the frontend client of the Sports Betting AI. This is where all user interactions will occur.

# Installation

## Option 1 (Docker)
### Dependencies
* Docker (WSL2 if on Windows)

### Step 1
* Since none of the required dependencies are installed locally, there is a command used to get the inital files setup
* Documentation: https://laravel.com/docs/9.x/sail#installing-composer-dependencies-for-existing-projects
* This following command will spin up a temporary docker container to install the dependencies
 ```sh
 docker run --rm \
    -u "$(id -u):$(id -g)" \
    -v $(pwd):/var/www/html \
    -w /var/www/html \
    laravelsail/php81-composer:latest \
    composer install --ignore-platform-reqs 
```

### Step 2
* Now to run the docker-compose.yml file to bring up the server
* `./vendor/bin/sail up`
* This will start all the services and a webserver on `localhost:80`

### Additional Help
* The Sail documentation has many more helpful tips to get a better setup running
* https://laravel.com/docs/9.x/sail

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
---
### Step 3
* Compile assets
* Non-docker - `npm run dev` or `npm run prod`
* Docker - `./vendor/bin/sail npm run dev`

