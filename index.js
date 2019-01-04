const path = require("path");
const fs = require("fs");
module.exports = function Shitbrawler(mod) {
	const cmd = mod.command || mod.require.command;
	let config = {}, gameId = null, enabled = false, isSorc = false, inBuff = false, itemCd = {brooch: 0, rootbeer: 0};
	try {
		config = require('./config.json'); }
	catch(e) { 
		config = {
			"brooch": 98406,
			"rootbeer": 80081
		};
		fs.writeFileSync(path.join(__dirname, "config.json"), JSON.stringify(config, null, 2));
	}
	
	cmd.add('sorc', (arg) => {
		if (!isSorc) {
			msg(`You are not sorc`);
		} else {
			enabled = !enabled;
			msg(`Shitsorc now ${enabled ? 'Enabled' : 'Disabled'}`);
		}
	});
	
	mod.hook('S_LOGIN', 12, (event) => {
		gameId = event.gameId;
		isSorc = (event.templateId - 10101) % 100 === 4;
		if (isSorc) enabled = true;
		else enabled = false;
	});
	
	mod.hook('C_PRESS_SKILL', 4, (event) => {
		if(!enabled || !inBuff) return;
		let now = Date.now();
 		if (now > itemCd.brooch) useItem(config.brooch);
 		if (now > itemCd.rootbeer) useItem(config.rootbeer);
		inBuff = false;
	});

	mod.hook('S_ABNORMALITY_BEGIN', 3, (event) => {
		if(!enabled) return;
		if(event.target === gameId && event.id === 500150)
			inBuff = true;
		
			let now = Date.now();
 			if (now > itemCd.brooch) useItem(config.brooch);
 			if (now > itemCd.rootbeer) useItem(config.rootbeer);
	});
	
	mod.hook('S_ABNORMALITY_END', 1, (event) => {
		if(!enabled) return;
		if(event.target === gameId && event.id === 500150)
			inBuff = false;
	}
	
	mod.hook('S_START_COOLTIME_ITEM', 1, {order: Number.NEGATIVE_INFINITY}, event => {
 		if(!enabled) return;
 		if(event.item === config.brooch) itemCd.brooch = Date.now() + event.cooldown * 1000;
 		else if(event.item === config.rootbeer) itemCd.rootbeer = Date.now() + event.cooldown * 1000;
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