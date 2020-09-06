const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//create schema for packages
const PackageSchema = new Schema({
    carrier: {
        type: String,
        enum: ['UPS', 'USPS', 'FedEx', 'OnTrac'],
        required: [true, 'The carrier text field is required']
    },
    trackingNumber: {
        type: String,
        required: [true, 'The carrier tracking number is required']
    },
    lastStatus: {
        type: String,
        default: 'Package has been added to tracker'
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    dateAdded: {
        type: Date,
        default: Date.now
    },
    description: String,
    dateDelivered: {
        type: Date,
        default: null
    },
    isArchived: {
        type: Boolean,
        default: false
    }
});

//create model for todo
const Package = mongoose.model('package', PackageSchema);

module.exports = Package;
