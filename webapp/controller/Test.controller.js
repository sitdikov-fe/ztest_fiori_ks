sap.ui.define([
	'sap/ui/comp/library',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/m/Token',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/table/Column',
	'sap/m/Column',
	'sap/m/Text',
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment"
], function(compLibrary, Controller, TypeString, ColumnListItem, Label, SearchField, Token, Filter, FilterOperator,
	ODataModel, UIColumn, MColumn, Text, History, Fragment) {
	"use strict";

	var oMultiInput;

	return Controller.extend("ztest_fiori_ks.controller.Test", {
		onInit: function() {

			// Value Help Dialog standard use case with filter bar without filter suggestions
			oMultiInput = this.byId("multiInput");
			this._oMultiInput = oMultiInput;

			this.oProductsModel = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.getView().setModel(this.oProductsModel);
			// oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			// this.getView().byId("multiInputWithSuggestions").setModel(oModel);
		},

		onBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			//The history contains a previous entry
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				// There is no history!
				// replace the current hash with page 1 (will not add an history entry)
				this.getOwnerComponent().getRouter().navTo("page1", null, true);
			}
		},

		onExit: function() {
			if (this.oProductsModel) {
				this.oProductsModel.destroy();
				this.oProductsModel = null;
			}
		},

		onValueHelpRequested: function() {
			this._oBasicSearchField = new SearchField();
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VHOpenDoc",
					controller: this
				});
				// this.pDialog = this.loadFragment({
				// 	name: "ztest_fiori_ks.view.VH"
				// });
			}
			this.pDialog.then(function(oDialog) {
				var oFilterBar = oDialog.getFilterBar();
				this._oVHD = oDialog;
				// Initialise the dialog with model only the first time. Then only open it
				if (this._bDialogInitialized) {
					// Re-set the tokens from the input and update the table
					oDialog.setTokens([]);
					oDialog.setTokens(this._oMultiInput.getTokens());
					oDialog.update();

					oDialog.open();
					return;
				}
				this.getView().addDependent(oDialog);

				// Set key fields for filtering in the Define Conditions Tab
				oDialog.setRangeKeyFields([{
					label: "Type",
					key: "Zzorder",
					type: "String",
					typeInstance: new TypeString({}, {
						maxLength: 5
					})
				}]);
				// oDialog.setRangeKeyFields([{
				// 	label: "Type",
				// 	key: "Zzorder",
				// 	type: "integer",
				// 	typeInstance: new TypeInteger({}, {
				// 		maxLength: 5
				// 	})
				// }]);

				// Set Basic Search for FilterBar
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				// Trigger filter bar search when the basic search is fired
				this._oBasicSearchField.attachSearch(function() {
					oFilterBar.search();
				});

				oDialog.getTableAsync().then(function(oTable) {

					oTable.setModel(this.oProductsModel);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable.bindRows) {
						// Bind rows to the ODataModel and add columns
						oTable.bindAggregation("rows", {
							path: "/ZtestShDocnumKosiSet",
							events: {
								dataReceived: function() {
									oDialog.update();
								}
							}
						});
						oTable.addColumn(new UIColumn({
							label: "Type",
							template: "Zzorder"
						}));
						oTable.addColumn(new UIColumn({
							label: "Description",
							template: "Zzdesc"
						}));
					}

					// For Mobile the default table is sap.m.Table
					if (oTable.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable.bindAggregation("items", {
							path: "/ZtestShDocnumKosiSet",
							template: new ColumnListItem({
								cells: [new Label({
									text: "{Zzorder}"
								}), new Label({
									text: "{Zzdesc}"
								})]
							}),
							events: {
								dataReceived: function() {
									oDialog.update();
								}
							}
						});
						oTable.addColumn(new MColumn({
							header: new Label({
								text: "Type"
							})
						}));
						oTable.addColumn(new MColumn({
							header: new Label({
								text: "Description"
							})
						}));
					}
					oDialog.update();
				}.bind(this));

				oDialog.setTokens(this._oMultiInput.getTokens());

				// set flag that the dialog is initialized
				this._bDialogInitialized = true;
				oDialog.open();
			}.bind(this));
		},
		onFilterBarSearch: function(oEvent) {
			var aFilters = [];
			var sQuery1 = oEvent.getParameter("selectionSet")[0].getProperty("value");
			var sQuery2 = oEvent.getParameter("selectionSet")[1].getProperty("value");
			console.log("sQ1 : ", sQuery1, "; sQ2 : ", sQuery2);
			if ((sQuery1 && sQuery1.length > 0) || (sQuery2 && sQuery2.length > 0)) {
				var filter = new Filter({
					filters: [
						new Filter({
							path: "Zzorder",
							operator: FilterOperator.Contains,
							value1: sQuery1
						}),
						new Filter({
							path: "Zzdesc",
							operator: FilterOperator.Contains,
							value1: sQuery2
						})
					],
					and: true
				});
				console.log(filter);
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this._oVHD.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		onValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			console.log("event : ", oEvent.getParameter);
			// console.log("Token : ",aTokens);
			// console.log(aTokens[0].mProperties.key);
			// this._oMultiInput.setTokens(aTokens);
			this._oMultiInput.setValue(aTokens[0].mProperties.key);
			this._oVHD.close();
		},

		onValueHelpCancelPress: function() {
			this._oVHD.close();
		}
	});
});