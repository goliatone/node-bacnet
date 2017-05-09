'use strict';

const extend = require('gextend');
const EventEmitter = require('events');

const DEFAULTS = require('./defaults').bacnetOptions;

class BacMockTransport extends EventEmitter {
    constructor(options) {
        super();
        this.init(options);
    }

    init(config) {
        config = extend({}, DEFAULTS, config);

        extend(this, config);
    }

    whoIs(lowLimit, highLimit, address) {

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

    }

}

module.exports = BacMockTransport;

module.exports.buildTransport = function(options) {
    return new BacMockTransport(options);
};
