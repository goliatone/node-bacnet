'use strict';

const extend = require('gextend');
const EventEmitter = require('events');

const DEFAULTS = require('./defaults-mock');

class BacMockTransport extends EventEmitter {

    constructor(options) {
        super();
        this.init(options);
    }

    init(config) {
        config = extend({}, DEFAULTS, config);

        this.devices = [];

        extend(this, config);
    }

    whoIs(lowLimit, highLimit, address) {
        this.emitDevices(lowLimit, highLimit, address);
    }

    emitDevices(lowLimit, highLimit, address) {
        this.intervalDevices = this.devices.concat();

        this.intervalId = setInterval(() => {
            let d = this.getDevice();
            if(!d) return clearInterval(this.intervalId);

            this.emit('iAm', d.address, d.deviceId, d.maxAdpu, d.segmentation, d.vendorId);
        }, this.interval);
    }

    getDevice() {
        return this.intervalDevices.pop();
    }


    /**
     *
     * @param  {String}   address        IP address of target device
     * @param  {Number}   objectType     BACnet object type
     * @param  {Number}   objectInstance BACnet object instance
     * @param  {Number}   propertyId     property id in the specified object to read
     * @param  {Number}   arrayIndex     array index of the property to be read.
     * @param  {Function} next           callback
     * @return {void}
     */
    readProperty(address, objectType, objectInstance, propertyId, arrayIndex, next) {
        let timeout = this.getRandomInt(this.minLatency, this.maxLatency);
        let o = {
            address, objectType, objectInstance, propertyId, arrayIndex, next
        };
        o.success = this.getRandomSuccess();

        setTimeout(() => {
            let result = this.getReadPropertyResult(o);
            next(result.err, result.value);
        }, timeout);
    }

    getReadPropertyResult(o) {
        return {
            err: null,
            value: {

            }
        };
    }

    getWritePropertyResult(o){
        return {
            err: null,
            value: {

            }
        };
    }

    /**
     *
     * @param  {String}   address        IP address of target device
     * @param  {Number}   objectType     BACnet object type
     * @param  {Number}   objectInstance BACnet object instance
     * @param  {Number}   propertyId     property id in the specified object to read
     * @param  {Number}   priority       array index of the property to be read.
     * @param  {Array}    valueList      A list of values to be written to the speicifed property. The Tag value has to be a BacnetApplicationTags declaration as specified in lib/bacnet-enum.js.
     * @param  {Function} next           callback
     * @return {void}
     */
    writeProperty(address, objectType, objectInstance, propertyId, priority, valueList, next) {
        let timeout = this.getRandomInt(this.minLatency, this.maxLatency);
        let o = {
            address, objectType, objectInstance, propertyId, priority, valueList
        };

        o.success = this.getRandomSuccess();

        setTimeout(() => {
            let result = this.getWritePropertyResult(o);
            next(result.err, result.value);
        }, timeout);
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getRandomSuccess() {
        let inc = this.getRandomInt(0, 99) < 50;
        return inc;
    }

}

module.exports = BacMockTransport;

module.exports.buildTransport = function(options) {
    return new BacMockTransport(options);
};
