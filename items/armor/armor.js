function itemFunction(item, player) {
	if (item.id == 'armor_leather_helmet' || item.id == 'armor_leather_chestplate' || item.id == 'armor_leather_leggings' || item.id == 'armor_leather_boots') {
		player.setArmor(item.id);
	}
}
module.exports = { itemFunction };