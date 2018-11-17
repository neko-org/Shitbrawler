const path = require("path");
const fs = require("fs");
module.exports = function Shitbrawler(mod) {
	const cmd = mod.command || mod.require.command;
	let config = {}, gameId = null, enabled = false, isBrawler = false, itemCd = {brooch: 0, rootbeer: 0};
	try {
		config = require('./config.json'); }
	catch(e) { 
		config = {
			"brooch": 51028,
			"rootbeer": 80081
		};
		fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(config, null, 2));
	}
	
	cmd.add('brawler', (arg) => {
		if (!isBrawler) {
			msg(`You are not brawler`);
		} else {
			enabled = !enabled;
			msg(`Shitbrawler now ${enabled ? 'Enabled' : 'Disabled'}`);
		}
	});
	
	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
		if(!enabled) return;
		if(event.item === config.brooch) itemCd.brooch = Date.now() + event.cooldown * 1000;
		else if(event.item === config.rootbeer) itemCd.rootbeer = Date.now() + event.cooldown * 1000;
	});
	
	mod.hook('S_ABNORMALITY_BEGIN', 2, (event) => {
		if(!enabled) return;
		//10153190 10153210 ???
		if(event.id === 10153190 && event.target.equals(gameId))  {
			let now = Date.now();
			if (now > itemCd.brooch) useItem(config.brooch);
			if (now > itemCd.rootbeer) useItem(config.rootbeer);
		}
	});

	mod.hook('S_LOGIN', 10, (event) => {
		gameId = event.gameId;
		isBrawler = (event.templateId - 10101) % 100 === 10;
		if (isBrawler) enabled = true;
		else enabled = false;
	});
	
	function useItem(itemId) {
		if (itemId === 0) return;
		mod.toServer('C_USE_ITEM', 3, {
			gameId: gameId,
			id: itemId,
			amount: 1,
			unk4: true
		});
	}
	
	function msg(msg){
		cmd.message(msg);
	}
}