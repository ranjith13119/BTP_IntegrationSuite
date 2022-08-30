/**
 * This module was created by the BASEditor
 */
sap.ui.define(["sap/ui/integration/Designtime"], function (
    Designtime
) {
    "use strict";
    return function () {
        return new Designtime({
	"form": {
		"items": {
			"selectedSuppliersID": {
				"manifestpath": "/sap.card/configuration/parameters/selectedSuppliersID/value",
				"type": "integer",
				"label": "The default selected shipper",
				"translatable": false
			},
			"maxItems": {
				"manifestpath": "/sap.card/configuration/parameters/maxItems/value",
				"type": "integer",
				"label": "Maximum Items",
				"translatable": false,
				"description": "Defines how many items will be displayed at most."
			}
		}
	},
	"preview": {
		"modes": "Abstract"
	}
});
    };
});