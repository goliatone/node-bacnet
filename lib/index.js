'use strict';

const extend = require('gextend');
const EventEmitter = require('events');

const DEFAULTS = require('./defaults');

class Bacnet extends EventEmitter {
    constructor(options) {
        super();
        this.init(options);
    }

    init(config) {
        config = extend({}, DEFAULTS, config);

        extend(this, config);

        this.reset();
    }

    connect(options) {

        options = extend({}, this.bacnetOptions, options);

        return new Promise((resolve, reject) => {
            if(this.connected) {
                //@TODO: Should we check to see if we have a
                //different connection object?
                return resolve(this);
            }

            try {
                this.server = this.buildTransport(options);
                this.server.on(this.WHOIS_EVENT, this.onDeviceAdded.bind(this));
            } catch(err) {
                return reject(err);
            }

            this.connected = true;

            resolve(this);
        });
    }

    reset() {
        this.connected = false;
        this.devices = new Map();

        if(this.server) {
            this.server.removeAllListeners(this.WHOIS_EVENT);
        }
    }

    /**
     * Factory method to construct the
     * BACnet transport layer.
     *
     * @param  {Object} options Transport options.
     * @return {Object}
     */
    buildTransport(options) {
        throw new Error('This method should be implemented');
    }

    /**
     * The whoIs command discovers all BACNET
     * devices in the network.
     *
     * deviceAddress [number] - Minimal device instance number to search for. Optional.
     * deviceIdMin [number] - Maximal device instance number to search for. Optional.
     * deviceIdMax [string] - Unicast address if command should device directly. Optional.
     *
     * @param  {Object} options
     * @return {Promise}
     */
    whoIs(options) {
        let o = options;
        return new Promise((resolve, reject) => {

            if(!this.connected) {
                return reject({err: 'Not connected'});
            }

            this.server.whois(o.deviceAddress, o.deviceIdMin, o.deviceIdMax);

            resolve();
        });
    }

    onDeviceAdded(iam) {
        // {
        //     deviceId: 9005,
        //     vendorId: 432,
        //     segmentation: 1,
        //     src: {
        //         mac: {
        //             ip: '10.51.70.30',
        //             port: 47808
        //         },
        //         network: 0
        //     }
        // }
        iam.address = iam.src.map.ip;

        this.devices.set(iam.deviceId, iam);
    }

    /**
     * The readProperty command reads a single
     * property of an object from a device.
     *
     * address [string] - IP address of the target device.
     * objectType [number] - The BACNET object type to read.
     * objectInstance [number] - The BACNET object instance to read.
     * propertyId [number] - The BACNET property id in the specified object to read.
     * arrayIndex [number] - The array index of the property to be read.
     * next [function] - The callback containing an error, in case of a failure and value object in case of success.
     *
     * @param  {Object} options
     * @return {Promise}
     */
    readProperty(options) {

        let o = options;
        let _tx = this.server._transport;

        return new Promise((resolve, reject) => {

            if(!this.connected) {
                return reject({err: 'Not connected'});
            }

            this.server.readProperty(o.address, o.objectType, o.objectInstance, o.propertyId, o.index, (err, property) => {
                if (err) {
                    console.log('Error', err);
                    return reject(err);
                }

                let value = Array.isArray(property.value) ? property.value[0] : property.value;

                function objectIdToString(objectId) {
                    return _tx.objectTypeToString(objectId.type) + '/' + objectId.instance;
                }

                resolve({
                    value: value,
                    object: objectIdToString(property.object),
                    objectType: o.objectType,
                    property: _tx.propertyKeyToString(property.property),
                    objectInstance: o.objectInstance
                });
            });
        });
    }

    /**
     * The writeProperty command writes a single
     * property of an object to a device.
     *
     * address [string] - IP address of the target device.
     * objectType [number] - The BACNET object type to write.
     * objectInstance [number] - IP address of the target device.
     * propertyId [number] - The BACNET property id in the specified object to write.
     * priority [number] - The priority to be used for writing to the property.
     * value [Mixed] -
     * tag [String] -
     *
     * @param  {Object} options
     * @return {Promise}
     */
    writeProperty(options) {
        let o = options;
        let value = this.makeValueList(o);
        return new Promise((resolve, reject) => {

            if(!this.connected) {
                return reject({err: 'Not connected'});
            }

            this.server.writeProperty(o.address, o.objectType, o.objectInstance, o.propertyId, false, value, (err, property) => {
                if(err) reject(err);
                else resolve(property);
            });
        });
    }

    readProperties(optionsArray) {
        let promises = [];

        optionsArray.map((o) => {
            promises.push(this.readProperty(o));
        });

        return Promise.all(promises);
    }

    writeProperties(optionsArray) {
        let promises = [];

        optionsArray.map((o) => {
            promises.push(this.writeProperty(o));
        });

        return Promise.all(promises);
    }

    makeValueList(o) {
        throw new Error('This method should be implemented');
    }
}
