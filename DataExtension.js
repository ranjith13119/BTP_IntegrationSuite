sap.ui.define([
    "sap/ui/integration/Extension",
    'sap/m/MessageToast',
    "sap/ui/integration/ActionDefinition"
], function (Extension, MessageToast, ActionDefinition) {
    "use strict";

    return Extension.extend("card.explorer.quickActions.QuickActionsExtension", {
        init: function () {
            Extension.prototype.init.apply(this, arguments);
            this.attachAction(this._handleAction.bind(this));
        },

        onCardReady: function () {
            this.getCard().addActionDefinition(new ActionDefinition({
                type: "Custom",
                text: "Refresh Data",
                parameters: {
                    "method": "refresh"
                }
            }));
        },

        _updateData: function () {
            this.getCard().showLoadingPlaceholders();
            this.getCard().getModel().setProperty("/values", [{
                "ProductID": 1,
                "ProductName": "Chai",
                "SupplierID": 1,
                "CategoryID": 1,
                "QuantityPerUnit": "10 boxes x 20 bags",
                "UnitPrice": "18.0000",
                "UnitsInStock": 39,
                "UnitsOnOrder": 0,
                "ReorderLevel": 10,
                "Discontinued": false
            }]);
            this.getCard().hideLoadingPlaceholders();
            this.getCard().refreshData();
            MessageToast.show("updated");
        },

        getData: async function () {
            var oCard = this.getCard(),
                oParameters = oCard.getCombinedParameters();
            var aprods = await oCard.request({
                "url": "{{destinations.Northwind}}/Products",
                "parameters": {
                    "$format": "json",
                    "$count": true,
                    "$skip": "{paginator>/skip}",
                    "$top": oParameters.maxItems,
                    "$orderby": "ProductID asc",
                    "$filter": "SupplierID eq {= ${filters>/supplier/selectedSuppliersID/value} ? ${filters>/supplier/value} : 1}"
                }
            });
            aprods && aprods.value && aprods.value.forEach((prod) => { prod.isFavVisible = true; prod.isRemove = false; });
            return Promise.resolve(aprods);
        },

        _removeItem: function (sProductId) {
            this.getCard().request({
                "url": `{{destinations.Northwind}}/Products/${sProductId}`,
                method: "DELETE",
                dataType: "text"
            });
        },

        _addOrRemoveFav: function (mId, bVisible) {
            var aModelData = this.getCard().getModel().getData();
            var oSelectedValue = aModelData && aModelData.value.find(prod => prod.ProductID == mId);
            oSelectedValue.isFavVisible = bVisible;
            oSelectedValue.isRemove = !bVisible;
            this.getCard().getModel().refresh();
            return oSelectedValue;
        },

        _addToFav: function (sProductId) {
            this.getCard().request({
                "url": "{{destinations.Northwind}}/$batch",
                "method": "POST",
                "batch": {
                    "supplier": {
                        "method": "GET",
                        "url": `{{destinations.Northwind}}/Products/${sProductId}`,
                        "headers": {
                            "Accept": "application/json"
                        }
                    },
                    "products": {
                        "method": "GET",
                        "url": `{{destinations.Northwind}}/Suppliers`,
                        "headers": {
                            "Accept": "application/json"
                        }
                    }
                }
            })
        },

        _handleAction: function (oEvent) {
            var oParameters = oEvent.getParameter("parameters");
            oEvent.preventDefault();
            switch (oParameters && oParameters.method) {
                case "addToFavorites":
                    let oProduct = this._addOrRemoveFav(oParameters.id, false);
                    this._addToFav(oProduct.ProductID);
                    MessageToast.show(`${oProduct.ProductName} is added to the Fav`);
                    break;
                case "remove":
                    let oProductt = this._addOrRemoveFav(oParameters.id, true);
                    this._removeItem(oProductt.ProductID);
                    MessageToast.show(`${oProductt.ProductName} is removed from the Fav`);
                    break;
                case "openSnack":
                    break;
                case "reject":
                    break;
                case "approve":
                    break;
                case "refresh":
                    this._updateData();
                    break;
                default:
                    break;
            }
        }
    });
});