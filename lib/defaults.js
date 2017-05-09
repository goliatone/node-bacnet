'use strict';

const bacstack = require('bacstack');

let config = {
    buildTransport: bacstack,
    applicationTags: require('bacstack/lib/bacnet-enum').BacnetApplicationTags,
    bacnetOptions: {
        /**
         * Use BAC1 as communication port
         * @type {Number}
         */
        port: 47809,
        /**
         * Listen on a specific interface
         * @type {String}
         */
        interface: undefined,
        /**
         * Use the subnet broadcast address
         * @type {String}
         */
        broadcastAddress: '255.255.255.255',
        /**
         * Response timeout
         * @type {Number}
         */
        adpuTimeout: 3000
    }
};

if(process.env.NODE_ENV === 'test') {
    config.buildTransport = require('./transport-mock').buildTransport;
}


module.exports = config;
