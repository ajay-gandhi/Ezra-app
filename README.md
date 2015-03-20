# Ezra

A native app to replace PeopleSoft's Student Center from the 1800s.

## Installation

Because Ezra is still in development, it doesn't come packaged with any of its
dependencies. Therefore, starting the app is a short process.

First, download and install the following applications:

* the [Atom editor](https://atom.io)
* [atom-shell](https://github.com/atom/atom-shell)
* [Node.js](http://nodejs.org)

Next, clone this repo (or download as a zip) and navigate to it in your command
line:

    cd Ezra-app/

The next step takes care of installing Node.js dependencies. One of these,
Zombie.js (the headless browser) fails when installed with APM. Thus, although
it is included in the `package.json` file, you must remove it before installing
packages.

Remove the specified line in `package.json`:

    "dependencies": {
      "es6-promise": "^2.0.1",
      "express": "^4.12.0",
      "jsonfile": "^2.0.0",
      "request": "^2.53.0",
      "request-promise": "^0.4.0",
      "xkeychain": "0.0.5",         // Remove the comma
      "zombie": "^2.5.1"            // Delete this line
    }

Don't forget to remove the comma in the previous line.

Zombie.js is still required for Ezra, so install it using `npm`:

    npm install zombie

Now, install the rest of the Node.js dependencies by running:

    apm install

You're ready! Run the app by executing:

    atom-shell .

(Assuming atom-shell is installed as `atom-shell`.)

## Contributing

If you feel like adding something, put together some well-documented code and
submit a pull-request!