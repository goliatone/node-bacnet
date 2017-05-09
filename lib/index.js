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
                this.server.on('iAm', this.onDeviceAdded.bind(this));
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
            this.server.removeAllListeners('iAm');
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
     * lowLimit [number] - Minimal device instance number to search for. Optional.
     * highLimit [number] - Maximal device instance number to search for. Optional.
     * address [string] - Unicast address if command should device directly. Optional.
     *
     * @param  {Object} options
     * @return {Promise}
     */
    whoIs(options) {
        let o = options;
        return new Promise((resolve, reject) => {

            if(!this.connected) {
                reject({err: 'Not connected'});
            }

            this.server.whoIs(o.lowLimit, o.highLimit, o.address);
            
            resolve();
        });
    }

    onDeviceAdded(address, deviceId, maxAdpu, segmentation, vendorId) {
        let device = {
            address,
            deviceId,
            maxAdpu,
            segmentation,
            vendorId
        };

        this.devices.set(deviceId, device);
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

        return new Promise((resolve, reject) => {

            if(!this.connected) {
                reject({err: 'Not connected'});
            }
            let addr = o.address,
                type = o.objectType,
                instance = o.objectInstance,
                id = o.propertyId,
                i = o.arrayIndex;

            this.server.readProperty(addr, type, instance, id, i, (err, value) => {
                if(err) return reject(err);
                resolve(value);
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
     * valueList [array] - A list of values to be written to the speicifed property. The Tag value has to be a BacnetApplicationTags declaration as specified in lib/bacnet-enum.js.
     *
     * @param  {Object} options
     * @return {Promise}
     */
    writeProperty(options) {
        let o = options;

        return new Promise((resolve, reject) => {

            if(!this.connected) {
                reject({err: 'Not connected'});
            }

            let addr = o.address,
                type = o.objectType,
                instance = o.objectInstance,
                id = o.propertyId,
                p = o.priority;

            let val = this.makeValueList(o);

            this.server.readProperty(addr, type, instance, id, p, val, (err, value) => {
                if(err) return reject(err);
                resolve(value);
            });
        });
    }

    makeValueList(o) {
        if(o.valueList) {
            return o.valueList;
        }
        let tag = o.tag,
        value = o.value;
        return [{Tag: tag, Value: value}];
        // applicationTags
    }
}
