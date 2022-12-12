sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/odata/CountMode",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	'sap/ui/comp/library',
	'sap/ui/model/type/String',
	'sap/m/ColumnListItem',
	'sap/m/Label',
	'sap/m/SearchField',
	'sap/ui/table/Column',
	'sap/m/Column',
	'sap/m/Text'
], function(Controller, History, ODataModel, Sorter, Filter, CountMode, FilterOperator, Fragment, syncStyleClass, MessageToast,
	MessageBox, JSONModel, compLibrary, TypeString, ColumnListItem,
	Label, SearchField, UIColumn, MColumn, Text) {
	"use strict";
	var state;
	var oIdOrder;
	var type;
	var oModel;
	var oModelnew;
	var oUserName;
	var oDataSap;
	var oUserData;
	var oStatusOrder;
	var oIdClient;
	var oDesc;
	var oExit;
	var isErrorResponse;
	var isActive;

	var oMultiInput;
	var oMultiInput2;

	return Controller.extend("ztest_fiori_ks.controller.Create02", {
		onInit: function() {
			// Value Help Dialog standard use case with filter bar without filter suggestions
			oMultiInput = this.byId("multiInput");
			this._oMultiInput = oMultiInput;
			oMultiInput2 = this.byId("multiInput2");
			this._oMultiInput2 = oMultiInput2;

			oModel = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			oModelnew = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.oProductsModel = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.getView().setModel(this.oProductsModel);
			this.oProductsModel2 = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.getView().setModel(this.oProductsModel2);
			// this.getView().setModel(this.oModel);
			isActive = 0;
			// this.getView().byId("oSelectClient").setModel(oModel);
			// this.getView().byId("oSearchField").setModel(oModel);
			this.getView().byId("stateOrder").setValue("Новый");

			this._getUserData();
			this.getResourceBundle();
			this._getDateResorces();
		},
		_getUserData: function() {
			var readurl = "/zUserDataSet";
			oModel.read(readurl, {
				success: function(oData, oResponse) {
					sap.ui.getCore().setModel(oData.valueOf().results[0].zUserName, "oUserData");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zData, "oUserName");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zIdOrder, "oOrderId");
					sap.ui.getCore().setModel(oData.valueOf().results[0].zViewData, "oDataSap");
				}.bind(this)
			});
		},

		_getDateResorces: function() {
			oUserName = sap.ui.getCore().getModel("oUserData");
			oUserData = sap.ui.getCore().getModel("oUserName");
			oIdOrder = sap.ui.getCore().getModel("oOrderId");

			var oDate = new sap.ui.model.json.JSONModel({
				date: oUserData,
				user: oUserName,
				number: oIdOrder,
				state: state
			});
			this.getView().setModel(oDate);

			//this.onUpdateState();
		},
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		_onChangeId: function(number) {
			oIdClient = number;
			var readurl = "/zstclientSet('" + oIdClient + "')";
			oModel.read(readurl, {
				success: function(oData, oResponse) {
					this.getView().byId("oNameOrg").setValue(oData.valueOf().NameOrg);
					this.getView().byId("oAdrClient").setValue(oData.valueOf().Address);
					isErrorResponse = 0;
				}.bind(this),
				error: function(err) {
					isErrorResponse = 1;
				}
			});

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
			this.getOwnerComponent().getRouter().navTo("page1");
		},
		_createOrderSt: function() {
			oIdOrder = sap.ui.getCore().getModel("oOrderId");
			type = this.getView().byId("multiInput").getValue();
			oUserName = this.getView().byId("oUserName").getValue();
			oDataSap = sap.ui.getCore().getModel("oDataSap");
			oIdClient = this.getView().byId("multiInput2").getValue();
			oStatusOrder = this.getView().byId("stateOrder").getValue();
			oDesc = this.getView().byId("oDescDoc").getValue();

			var data = {};
			data.zzorder = oIdOrder;
			data.ZzorderType = type;
			data.Zzuser = oUserName;
			data.Zzdate = oDataSap;
			data.ZzclientId = oIdClient;
			data.Zzstatus = oStatusOrder;
			data.Zzdesc = oDesc;

			var parametr = {};
			parametr.zzorder = oIdOrder;
			parametr.zzopendoc = " ";
			parametr.zzsendmessage = " ";
			parametr.zzagree1 = " ";
			parametr.zzagree2 = " ";

			var react = true;
			var oParametrUrl = "/zParametrSaveSet";
			react = sap.ui.controller("ztest_fiori_ks.controller.Table01").onCreateTable(oIdOrder);

			var oCreateUrl = "/zOrderDateSet";
			if (react) {
				oModel.create(oCreateUrl, data, null,
					function(response) {
						MessageBox.success("Document : " + oIdOrder + " successfully created");
					},
					function(error) {
						MessageToast.show("Error while creating the data");
					}
				);

				oModelnew.create(oParametrUrl, parametr,
					function(RESPONSE) {
						MessageToast.show("Document : " + oIdOrder + " successfully created");
					},
					function(error) {}
				);
			} else {
				MessageBox.error("Error while creating the data");
				this.onExit();
			}
			MessageBox.success("Document : " + oIdOrder + " successfully created");

			if (oExit === 1) {
				this.onExit();
			}
		},
		onCreate: function() {
			this._createOrderSt();

		},
		onCheck: function() {
			if (sap.ui.controller("ztest_fiori_ks.controller.Table01").onCreateTable(-1)) {
				this._getDateResorces();
				// this.onChangeId();
				this.onUpdateState();
			}
		},
		_checkField: function() {
			oDesc = this.getView().byId("oDescDoc").getValue();
			// type = this.getView().byId("oSearchField").getValue();
			type = this.getView().byId("multiInput").getValue();
			if (oDesc === '' || type === '' || oIdClient === '') {
				isActive = 0;
			} else {
				isActive = 1;
			}
		},
		onUpdateState: function() {
			if (isErrorResponse === 1) {
				this.getView().byId("oNameOrg").setValue('value not found');
				this.getView().byId("oAdrClient").setValue('value not found');
			}

			this._checkField();
			if (isActive === 0) {
				this.getView().byId("stateOrder").setValue("Данные не заполнены");
				this.getView().byId("oButtonCreate").setEnabled(false);
			} else {
				this.getView().byId("stateOrder").setValue("Данные заполнены");
				this.getView().byId("oButtonCreate").setEnabled(true);
			}

		},

		// SH для типа документа

		onValueHelpRequested: function() {
			this._oBasicSearchField = new SearchField();
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VH",
					controller: this
				});

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
					key: "Ztype",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 3
					})
				}]);


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
							path: "/ZtestShTypedocKosiSet",
							events: {
								dataReceived: function() {
									oDialog.update();
								}
							}
						});
						oTable.addColumn(new UIColumn({
							label: "Type",
							template: "Ztype"
						}));
						oTable.addColumn(new UIColumn({
							label: "Description",
							template: "Zdesc"
						}));
					}


					// For Mobile the default table is sap.m.Table
					if (oTable.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable.bindAggregation("items", {
							path: "/ZtestShTypedocKosiSet",
							template: new ColumnListItem({
								cells: [new Label({
									text: "{Ztype}"
								}), new Label({
									text: "{Zdesc}"
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
			if ((sQuery1 && sQuery1.length > 0) || (sQuery2 && sQuery2.length > 0)) {
				var filter = new Filter({
					filters: [
						new Filter({
							path: "Ztype",
							operator: FilterOperator.Contains,
							value1: sQuery1
						}),
						new Filter({
							path: "Zdesc",
							operator: FilterOperator.Contains,
							value1: sQuery2
						})
					],
					and: true
				});
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this._oVHD.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");

		},

		onValueHelpOkPress: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput.setValue(aTokens[0].mProperties.key);
			this._oVHD.close();
		},

		onValueHelpCancelPress: function() {
			this._oVHD.close();
		},

		onOpenDialog: function() {
			// load BusyDialog fragment asynchronously
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			setTimeout(function() {
				oDialog.close();
			}, 1000);
		},

		// SH для типа компании

		onValueHelpRequested2: function() {
			this._oBasicSearchField2 = new SearchField();
			if (!this.pDialog2) {
				this.pDialog2 = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VHClientType",
					controller: this
				});

			}
			this.pDialog2.then(function(oDialog2) {
				var oFilterBar2 = oDialog2.getFilterBar();
				this._oVHD2 = oDialog2;
				// Initialise the dialog with model only the first time. Then only open it
				if (this._bDialogInitialized2) {
					// Re-set the tokens from the input and update the table
					oDialog2.setTokens([]);
					oDialog2.setTokens(this._oMultiInput2.getTokens());
					oDialog2.update();

					oDialog2.open();
					return;
				}
				this.getView().addDependent(oDialog2);

				// Set key fields for filtering in the Define Conditions Tab
				oDialog2.setRangeKeyFields([{
					label: "ID",
					key: "Id",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 4
					})
				}]);
				
				// Set Basic Search for FilterBar
				oFilterBar2.setFilterBarExpanded(false);
				oFilterBar2.setBasicSearch(this._oBasicSearchField2);

				// Trigger filter bar search when the basic search is fired
				this._oBasicSearchField2.attachSearch(function() {
					oFilterBar2.search();
				});

				oDialog2.getTableAsync().then(function(oTable2) {

					oTable2.setModel(this.oProductsModel2);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable2.bindRows) {
						// Bind rows to the ODataModel and add columns
						oTable2.bindAggregation("rows", {
							path: "/ZtestShClientKosiSet",
							events: {
								dataReceived: function() {
									oDialog2.update();
								}
							}
						});
						oTable2.addColumn(new UIColumn({
							label: "ID",
							template: "Id"
						}));
						oTable2.addColumn(new UIColumn({
							label: "Name",
							template: "NameOrg"
						}));
						oTable2.addColumn(new UIColumn({
							label: "Address",
							template: "Address"
						}));
					}

					// For Mobile the default table is sap.m.Table
					if (oTable2.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable2.bindAggregation("items", {
							path: "/ZtestShClientKosiSet",
							template: new ColumnListItem({
								cells: [new Label({
									text: "{Id}"
								}), new Label({
									text: "{NameOrg}"
								}), new Label({
									text: "{Address}"
								})]
							}),
							events: {
								dataReceived: function() {
									oDialog2.update();
								}
							}
						});
						oTable2.addColumn(new MColumn({
							header: new Label({
								text: "ID"
							})
						}));
						oTable2.addColumn(new MColumn({
							header: new Label({
								text: "Name"
							})
						}));
						oTable2.addColumn(new MColumn({
							header: new Label({
								text: "Address"
							})
						}));
					}
					oDialog2.update();
				}.bind(this));

				oDialog2.setTokens(this._oMultiInput2.getTokens());

				// set flag that the dialog is initialized
				this._bDialogInitialized2 = true;
				oDialog2.open();
			}.bind(this));
		},
		onFilterBarSearch2: function(oEvent) {
			var aFilters = [];
			var sQuery1 = oEvent.getParameter("selectionSet")[0].getProperty("value");
			var sQuery2 = oEvent.getParameter("selectionSet")[1].getProperty("value");
			var sQuery3 = oEvent.getParameter("selectionSet")[2].getProperty("value");
			if ((sQuery1 && sQuery1.length > 0) || (sQuery2 && sQuery2.length > 0) || (sQuery3 && sQuery3.length > 0)) {
				var filter = new Filter({
					filters: [
						new Filter({
							path: "Id",
							operator: FilterOperator.Contains,
							value1: sQuery1
						}),
						new Filter({
							path: "NameOrg",
							operator: FilterOperator.Contains,
							value1: sQuery2
						}),
						new Filter({
							path: "Address",
							operator: FilterOperator.Contains,
							value1: sQuery3
						})
					],
					and: true
				});
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this._oVHD2.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		onValueHelpOkPress2: function(oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			this._oMultiInput2.setValue(aTokens[0].mProperties.key);
			this._onChangeId(aTokens[0].mProperties.key);
			this._oVHD2.close();
		},

		onValueHelpCancelPress2: function() {
			this._oVHD2.close();
		}

	});

	// _setNotFoundClient: function() {
	// 	this.getView().byId("oNameOrg").setValue('value not found');
	// 	this.getView().byId("oAdrClient").setValue('value not found');
	// },

	// onSuggestType: function(event) {
	// 	var sValue = event.getParameter("suggestValue"),
	// 		aFilters = [];
	// 	if (sValue) {
	// 		aFilters.push(new Filter({
	// 			filters: [
	// 				new Filter("Zdesc", FilterOperator.Contains, sValue.toUpperCase())
	// 				// new Filter("Ztype", FilterOperator.Contains, sValue.toUpperCase())
	// 			],
	// 			and: false
	// 		}));
	// 	}

	// 	var oSource = event.getSource();
	// 	var oBinding = oSource.getBinding('suggestionItems');
	// 	oBinding.filter(aFilters);

	// 	oBinding.attachEventOnce('dataReceived', function() {
	// 		oSource.suggest();
	// 	});

	// },
	// onSuggestClient: function(event) {
	// 	var sValue = event.getParameter("suggestValue"),
	// 		aFilters = [];
	// 	if (sValue) {
	// 		aFilters.push(new Filter({
	// 			filters: [
	// 				new Filter("NameOrg", FilterOperator.Contains, sValue.toUpperCase())
	// 				// new Filter("Ztype", FilterOperator.Contains, sValue.toUpperCase())
	// 			],
	// 			and: false
	// 		}));
	// 	}

	// 	var oSource = event.getSource();
	// 	var oBinding = oSource.getBinding('suggestionItems');
	// 	oBinding.filter(aFilters);

	// 	oBinding.attachEventOnce('dataReceived', function() {
	// 		oSource.suggest();
	// 	});
	// 	this.onChangeId();

	// },

	// onChangeId: function() {
	// 	oIdClient = this.getView().byId("multiInput2").getValue();
	// 	var readurl = "/zstclientSet('" + oIdClient + "')";
	// 	oModel.read(readurl, {
	// 		success: function(oData, oResponse) {
	// 			this.getView().byId("oNameOrg").setValue(oData.valueOf().NameOrg);
	// 			this.getView().byId("oAdrClient").setValue(oData.valueOf().Address);
	// 			isErrorResponse = 0;
	// 		}.bind(this),
	// 		error: function(err) {
	// 			isErrorResponse = 1;
	// 		}
	// 	});

	// },

});