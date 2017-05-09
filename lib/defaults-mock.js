'use strict';

let config = {
    applicationTags: require('bacstack/lib/bacnet-enum').BacnetApplicationTags,
    bacnetOptions: require('./defaults').bacnetOptions,
    interval: 400,
    minLatency: 300,
    maxLatency: 1200,
    properties: {

    }
};

module.exports = config;
