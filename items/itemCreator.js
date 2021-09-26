const readline = require("readline");
const itemModel = require('../models/itemSchema');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config.json');
const wait = require('util').promisify(setTimeout);

mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('MongoDB Connected')
        startFunction();
    })
    .catch(err => console.log(err));

startFunction = async () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let obj = {}, valid = true;

    rl.question("Type item name: ", function (name) {
        rl.question("Type item description: ", function (description) {
            rl.question("Type item price: ", function (price) {
                if (!Number.isInteger(parseInt(price))) {
                    console.log('Price must be a number');
                    valid = false;
                    rl.close();
                }
                console.log('Format: /use <required> [optional]')
                rl.question("Type item use: ", function (use) {
                    console.log('Format: dir/file.js')
                    rl.question("Type item path: ", function (path) {
                        obj = {
                            name: name,
                            description: description,
                            price: parseInt(price),
                            use: use,
                            path: path
                        }
                        console.log(obj)
                        rl.question("Is this correct? (y/n): ", async function (answer) {
                            if (answer === 'y' && valid) {
                                console.log('Saving...')
                                let item = await itemModel.create({
                                    name: obj.name,
                                    description: obj.description,
                                    price: obj.price,
                                    use: obj.use,
                                    funcPath: obj.path
                                })
                                item.save();
                            } else if (answer === 'n' || !valid) {
                                console.log('Cancelling...')
                            } else {
                                console.log('Invalid input')
                            }
                            rl.close();
                        });
                    });
                });
            });
        });
    });

    rl.on("close", function () {
        console.log("\nBYE BYE !!!");
        process.exit(0);
    });
}