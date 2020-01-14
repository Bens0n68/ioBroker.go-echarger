"use strict";

/*
 * Created with @iobroker/create-adapter v1.18.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");

class GoEcharger extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "go-echarger",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}



	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("MQTT Port: " + this.config.MQTT-Port);
		this.log.info("Wallbox iP Adresse: " + this.config.Wallbox-ipAddress);
		this.log.info("Wallbox iP Adresse: " + this.config.MQTT-Object-Path);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		var myObjects = ["version", "rbc", "rbt", "car", "err", "cbl", "pha", "tmp", "dws", "adi", "uby", "eto", "wst", "nrg", "fwv", "sse", "eca", "ecr","ecd", "ec4", "ec5", "ec6", "ec7", "ec8", "ec9", "ec1", "rca", "rcr", "rcd", "rc4", "rc5", "rc6", "rc7", "rc8", "rc9", "rc1"];
		var myObjectLen = myObjects.length;

		for (var i = 0; i < myObjectLen; i++) {
			await this.setObjectAsync(myObjects[i], {
				type: "state",
				common: {
					name: myObjects[i],
					type: "number",
					role: "indicator",
					read: true,
					write: true,
					unite: "A",
				},
				native: {},
			});
		}

		// in this template all states changes inside the adapters namespace are subscribed
		this.subscribeStates("*");

//BE: Subscribe path of mqqt object!
		this.subscribeForeignObjects ('mqtt.0.go-eCharger.007566.status');

		 
		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw ioboker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		this.log.info(`object: ${id}, state: ${state}`); // Test BE
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

//test - ob dieser Event gefeurt wird??
	onForeignStateChange(id, state) {
		this.log.info(`onForeignStateChanged ist gefeuert worden :-)`);
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

//this.on('stateChange', function (id, state) {
//		if (id == 'mqtt.0.go-eCharger.007566.status'){
//	on({id: 'mqtt.0.go-eCharger.007566.status', change: "ne"}, function (obj) {
//			this.log.info(`eCharger Status change!`);
//ReadWallbox();
//---- Werte nur alle X Sekunden aktualisieren
//var iCurrTime = (new Date().getHours() * 3600 + new Date().getMinutes() * 60 + new Date().getSeconds());
//if (iCurrTime > (iLastUpdate + iAbfrageabstand)) {
//    log("Update mqqt" + " + cur=" + iCurrTime + ", last=" + iLastUpdate);
//    iLastUpdate = iCurrTime
//    ReadIt();
//}
// else
//    log("Update mqqt ausgesetzt");
//this.log.info(`state change .-)`); {
//});



	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new GoEcharger(options);
} else {
	// otherwise start the instance directly
	new GoEcharger();
}