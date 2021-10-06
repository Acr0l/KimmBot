const express = require('express'),
  router = express.Router(),
  app = express();
const itemModel = require('../models/itemSchema'),
        mongoose = require('mongoose'),
 { MONGODB_URI } = require('../config.json');

let obj = {};

app.set('view engine', 'ejs');
app.use('/', router);

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

router.get('/', async (req, res) => {
  if (req.query.submit == 'Yes') {
    // Create item
    console.log('Saving...');
    await createItem(obj);
    console.log('Item Created');
    res.redirect('/');
  } else if (req.query.submit == 'No') {
    // Cancel
    console.log('Item Creation Cancelled');
    res.redirect('/');
  } else {
    res.sendFile(__dirname + '/itemCreator.html');
  }
});

router.get('/create', (req, res) => {
  obj = req.query;
  console.log(obj);
  if (!obj.itemUnique) {
    obj['itemUnique'] = false;
  } else {
    obj['itemUnique'] = true;
  }
  res.render(__dirname + '/confirmation', obj);
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});

const createItem = async (obj) => {
  try {
    const item = await itemModel.create({
      name: obj.itemName,
      description: obj.itemDescription,
      price: obj.itemPrice,
      use: obj.itemUse,
      funcPath: obj.itemPath,
      unique: obj.itemUnique
    });
    item.save();
  } catch (err) {
    console.log(err);
  }
  return
};