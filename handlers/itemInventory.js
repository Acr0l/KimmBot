const itemData = require('../models/itemSchema');

const items = {};

const loadItems = async () => {
    try {
        const data = await itemData.find({});
        for (const item of data) {
            const itemId = item._id;

            items[itemId] = {
                id: itemId.toString(),
                name: item.name,
                description: item.description,
                type: item.iType,
                tier: item.tier,
                price: item.price,
                use: item.use,
                path: item.funcPath,
                unique: item.unique,
            };
        }
    } catch (err) {
        console.log(err);
    }
};

/**
 * @param { String } itemId - The id of the quiz.
 * @returns { Object } - The quiz object.
 * @description Gets a quiz by id.
 * @example
 * getItem('5e9f8f8f8f8f8f8f8f8f8f8');
 */
const getItem = (itemId) => {
    return items[itemId];
};

const getItemList = () => {
    return items;
};

module.exports = { loadItems, getItemList, getItem };
