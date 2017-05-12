'use strict';

let config = {
    WHOIS_EVENT: 'iam',
    buildTransport: function(options, device=false) {
        const bacnet = require('bacnet');

        let client = bacnet.init({
            datalink: options,
            device: device
        });
        client._transport = bacnet;
        return client;
    },
    makeValueList: function(o) {
        return new this.server._transport.BacnetValue(o.value, o.tag);
    },
    applicationTags: require('bacstack/lib/bacnet-enum').BacnetApplicationTags,
    bacnetOptions: {
        datalink: {
            iface: '127.0.0.1',
            'ip_port': 47808
        },
        device: true
    }
};

if(process.env.NODE_ENV === 'test') {
    config.buildTransport = require('./transport-mock').buildTransport;
}


module.exports = config;
