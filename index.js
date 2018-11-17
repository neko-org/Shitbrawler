const path = require("path");
const fs = require("fs");
module.exports = function Shitbrawler(mod) {
	const cmd = mod.command || mod.require.command;
	let config = {}, gameId = null, enabled = false, isBrawler = false;
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

	mod.hook('S_ABNORMALITY_BEGIN', 2, (event) => {
		if(!enabled) return;
		//10153190 10153210 ???
		if(event.id === 10153190 && event.target.equals(gameId))  {
			useItem(config.brooch); useItem(config.rootbeer);
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