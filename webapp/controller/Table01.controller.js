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
], function (Controller, History, ODataModel, Sorter, Filter, CountMode, FilterOperator, Fragment, syncStyleClass, MessageToast,
	MessageBox, JSONModel, compLibrary, TypeString, ColumnListItem,
	Label, SearchField, UIColumn, MColumn, Text) {

	_oDialog: null;
	"use strict";
	var oModel;
	var counter = 1;
	var oMultiInput3;
	var oMultiInput4;
	var sh3row;
	var sh4row;


	return Controller.extend("ztest_fiori_ks.controller.Table01", {
		onInit: function (oEvent) {

			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.oProductsModel3 = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.getView().setModel(this.oProductsModel3);
			this.oProductsModel4 = new ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this.getView().setModel(this.oProductsModel4);

			oMultiInput3 = this.byId("multiInput3");
			this._oMultiInput3 = oMultiInput3;
			oMultiInput4 = this.byId("multiInput4");
			this._oMultiInput4 = oMultiInput4;

			this.mode = "Edit";
			var dataModel = this.getOwnerComponent().getModel("tableData");
			this.getView().setModel(dataModel, "sOrder1");
			this.temp = JSON.stringify(this.getView().getModel("sOrder1").getData());

			// create a new model for property binding .for visible property
			var newModel1 = new JSONModel({
				visibleHeader: true,
				"editable": false,
				"valueState": "None",
				"add": true,
				"edit": true,
				"delete": true,
				"status": "completed",
				"status1": "Edited"

			});
			this.getView().setModel(newModel1, "newModel");
			window.temp = this;
		},

		onLiveChange: function (oEvent) {
			this.enteredValue = oEvent.getParameter("value");
			var _oInput = oEvent.getSource();
			var val = _oInput.getValue();
			val = val.replace(/[^\d]/g, '');
			_oInput.setValue(val);

			var rowdata = window.temp.getView().getModel("sOrder1").getData();

			rowdata.Sales.forEach(row => {
				if (row.Price > 0 && row.Quantity > 0) {
					row.FullPrice = row.Price * row.Quantity;
				};
			});

			that.getView().getModel("sOrder1").setData(rowdata);

		},
		onAdd: function (oEvent) {
			this.mode = "Add";
			var that = this;

			that.getView().getModel("newModel").setProperty("/editable", true);

			var newRecord = { //create a dummy record to push when user click on Add
				"Id": counter,
				"Name": "",
				"NameType": "",
				"Quantity": "",
				"Price": "",
				"FullPrice": "",
				"Storage": "",
				"Quanstorage": "",
				"editable": true,
				"neweditable": true
			};

			counter += 1;
			var oTableData = oEvent.getSource().getModel("sOrder1").getData(); //get table data
			oTableData.Sales.push(newRecord); //push this new record in model
			that.getView().getModel("sOrder1").setData(oTableData); //set data to the view
		},

		onChange: function (oEvent) {
			var that = this;
			var enteredText = oEvent.getParameters("value").value;
			this.recordexists = undefined;
			// var index=undefined;
			var sData = this.getView().getModel("sOrder1").getData().Sales; //get the model data
			var spath = parseInt(oEvent.getSource().getBindingContext("sOrder1").getPath().split("/")[2]); //get the index of enter data row

			var index = sData.findIndex(function (item, sindex) { //findIndex is a method used to validate if same value found it returns index position othervise it returns -1
				return item.Id === enteredText && sindex !== spath;
			});
			if (index > -1) {
				this.recordexists = index;
				that.getView().getModel("newModel").setProperty("/valueState", "Error"); //set value state to error
				MessageToast.show("Такая запись уже существует");

				return;
			}
			that.getView().getModel("newModel").setProperty("/valueState", "None");

		},

		onDelete: function (oEvent) {
			var move = 0;
			this.mode = "delete";
			var that = this;
			var sData = oEvent.getSource().getModel("sOrder1").getData();
			var oTable = this.byId("idSalesTable");
			var selectedRowData = oTable.getSelectedContexts(); //get the selected contexts 
			if (selectedRowData.length === 0) {
				MessageToast.show("Выберете хотя бы одну строку");
				return;
			} else {

				for (var i = selectedRowData.length - 1; i >= 0; i--) {
					var oThisObj = selectedRowData[i].getObject();
					counter -= 1;
					var index = $.map(sData.Sales, function (obj, index) {
						if (obj === oThisObj) {
							return index;
						}
					});
					sData.Sales.splice(index, 1); //delete  record by using Splice
				}

				that.getView().getModel("sOrder1").setData(sData); //after deleting set the data
				// this._oTable.getModel().setData(sData);
				oTable.removeSelections(true);

				sData.Sales.forEach(row => {
					move += 1;
					row.Id = move;
				});

				that.getView().getModel("sOrder1").setData(sData);

			}

		},

		onCreateTable: function (order) {

			var rawdata = window.temp.getView().getModel("sOrder1").getData().Sales;
			var data = {};
			var oCreateUrl = "/ztestStr001Set";
			var boolreact = true;
			var isEmpty = false;

			rawdata.forEach(row => {
				isEmpty = isEmpty || Object.values(row).some(x => x === '');
			});

			if (order == -1 && rawdata.length == 0) {
				MessageToast.show("Добавьте хотя бы одну строку в таблицу");
				return false;
			}

			if (order == -1 && isEmpty == true) {
				MessageToast.show("Заполните все поля в таблице");
				return false;
			} else if (order == -1) {
				return true;
			}

			if (isEmpty) {
				MessageToast.show("Заполните все поля в таблице");
			} else {
				rawdata.forEach(row => {
					data.Id = row.Id;
					data.Docnum = order;
					data.Name = row.Name;
					data.Nametype = row.NameType;
					data.Quantity = row.Quantity;
					data.Price = row.Price;
					data.Fullprice = row.FullPrice;
					data.Storege = row.Storage;
					data.Quanstorage = row.Quanstorage;

					oModel.create(oCreateUrl, data, null,
						function (response) { },
						function (error) {
							boolreact = false;
						}
					);
				});
			}
			return boolreact;
		},

		// SH для позиции

		onValueHelpRequested3: function (oEvent) {

			sh3row = oEvent.getSource().getBindingContext('sOrder1').getObject().Id;

			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this._oBasicSearchField3 = new SearchField();

			if (!this.pDialog3) {
				this.pDialog3 = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VHName",
					controller: this
				});

			}

			this.pDialog3.then(function (oDialog3) {
				var oFilterBar3 = oDialog3.getFilterBar();
				this._oVHD3 = oDialog3
				// Initialise the dialog with model only the first time. Then only open it
				if (this._bDialogInitialized3) {
					// Re-set the tokens from the input and update the table
					oDialog3.setTokens([]);
					oDialog3.setTokens(this._oMultiInput3.getTokens());
					oDialog3.update();

					oDialog3.open();
					return;
				}
				this.getView().addDependent(oDialog3);

				// Set key fields for filtering in the Define Conditions Tab
				oDialog3.setRangeKeyFields([{
					label: "Name",
					key: "Name",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 30
					})
				}]);

				// Set Basic Search for FilterBar
				oFilterBar3.setFilterBarExpanded(false);
				oFilterBar3.setBasicSearch(this._oBasicSearchField3);

				// Trigger filter bar search when the basic search is fired
				this._oBasicSearchField3.attachSearch(function () {
					oFilterBar3.search();
				});

				oDialog3.getTableAsync().then(function (oTable3) {

					oTable3.setModel(this.oProductsModel3);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable3.bindRows) {
						// Bind rows to the ODataModel and add columns
						oTable3.bindAggregation("rows", {
							path: "/ZtestshposSet",
							events: {
								dataReceived: function () {
									oDialog3.update();
								}
							}
						});
						oTable3.addColumn(new UIColumn({
							label: "Name",
							template: "Name"
						}));
						oTable3.addColumn(new UIColumn({
							label: "NameType",
							template: "NameType"
						}));
						oTable3.addColumn(new UIColumn({
							label: "Price",
							template: "Price"
						}));
					}

					// For Mobile the default table is sap.m.Table
					if (oTable3.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable3.bindAggregation("items", {
							path: "/ZtestshposSet",
							template: new ColumnListItem({
								cells: [new Label({
									text: "{Name}"
								}), new Label({
									text: "{NameType}"
								}), new Label({
									text: "{Price}"
								})]
							}),
							events: {
								dataReceived: function () {
									oDialog3.update();
								}
							}
						});
						oTable3.addColumn(new MColumn({
							header: new Label({
								text: "Name"
							})
						}));
						oTable3.addColumn(new MColumn({
							header: new Label({
								text: "NameType"
							})
						}));
						oTable3.addColumn(new MColumn({
							header: new Label({
								text: "Price"
							})
						}));
					}
					oDialog3.update();
				}.bind(this));

				oDialog3.setTokens(this._oMultiInput3.getTokens());

				// set flag that the dialog is initialized
				this._bDialogInitialized3 = true;
				oDialog3.open();
			}.bind(this));
		},
		onFilterBarSearch3: function (oEvent) {
			var aFilters = [];
			var sQuery1 = oEvent.getParameter("selectionSet")[0].getProperty("value");
			var sQuery2 = oEvent.getParameter("selectionSet")[1].getProperty("value");
			var sQuery3 = oEvent.getParameter("selectionSet")[2].getProperty("value");

			if ((sQuery1 && sQuery1.length > 0) || (sQuery2 && sQuery2.length > 0) || (sQuery3 && sQuery3.length > 0)) {
				var filter = new Filter({
					filters: [
						new Filter({
							path: "Name",
							operator: FilterOperator.Contains,
							value1: sQuery1
						}),
						new Filter({
							path: "NameType",
							operator: FilterOperator.Contains,
							value1: sQuery2
						}),
						new Filter({
							path: "Price",
							operator: FilterOperator.Contains,
							value1: sQuery3
						})
					],
					and: true
				});
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this._oVHD3.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		_onChangeId: function (number) {
			// oIdClient = number;
			var readurl = "/ZtestposSet('" + number + "')";
			oModel.read(readurl, {
				success: function (oData, oResponse) {
					// this.getView().byId("oNameOrg").setValue(oData.valueOf().NameOrg);
					// this.getView().byId("oAdrClient").setValue(oData.valueOf().Address);
					isErrorResponse = 0;
				}.bind(this),
				error: function (err) {
					isErrorResponse = 1;
				}
			});

		},

		onValueHelpOkPress3: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			var str = aTokens[0].mProperties.key;
			str = str.replace(/\s/g, '');
			// this._oMultiInput3.setValue(str);
			// this._onChangeId(str);_oMultiInput3
			this._oVHD3.close();
		},

		onValueHelpCancelPress3: function () {
			this._oVHD3.close();
		},

		onOpenDialog: function () {
			// load BusyDialog fragment asynchronously
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			setTimeout(function () {
				oDialog.close();
			}, 1000);
		},

		// SH для склада

		onValueHelpRequested4: function (oEvent) {

			sh4row = oEvent.getSource().getBindingContext('sOrder1').getObject().Id;

			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			this._oBasicSearchField4 = new SearchField();
			if (!this.pDialog4) {
				this.pDialog4 = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VHStorage",
					controller: this
				});

			}
			this.pDialog4.then(function (oDialog4) {
				var oFilterBar4 = oDialog4.getFilterBar();
				this._oVHD4 = oDialog4;
				// Initialise the dialog with model only the first time. Then only open it
				if (this._bDialogInitialized4) {
					// Re-set the tokens from the input and update the table
					oDialog4.setTokens([]);
					oDialog4.setTokens(this._oMultiInput4.getTokens());
					oDialog4.update();

					oDialog4.open();
					return;
				}
				this.getView().addDependent(oDialog4);

				// Set key fields for filtering in the Define Conditions Tab
				oDialog4.setRangeKeyFields([{
					label: "Storege",
					key: "Storege",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 30
					})
				}]);

				// Set Basic Search for FilterBar
				oFilterBar4.setFilterBarExpanded(false);
				oFilterBar4.setBasicSearch(this._oBasicSearchField4);

				// Trigger filter bar search when the basic search is fired
				this._oBasicSearchField4.attachSearch(function () {
					oFilterBar4.search();
				});

				oDialog4.getTableAsync().then(function (oTable4) {

					oTable4.setModel(this.oProductsModel4);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable4.bindRows) {
						// Bind rows to the ODataModel and add columns
						oTable4.bindAggregation("rows", {
							path: "/ZtestshstorSet",
							events: {
								dataReceived: function () {
									oDialog4.update();
								}
							}
						});
						oTable4.addColumn(new UIColumn({
							label: "Storege",
							template: "Storege"
						}));
						oTable4.addColumn(new UIColumn({
							label: "NameType",
							template: "NameType"
						}));
						oTable4.addColumn(new UIColumn({
							label: "Quanstorage",
							template: "Quanstorage"
						}));
					}

					// For Mobile the default table is sap.m.Table
					if (oTable4.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable4.bindAggregation("items", {
							path: "/ZtestshstorSet",
							template: new ColumnListItem({
								cells: [new Label({
									text: "{Storege}"
								}), new Label({
									text: "{NameType}"
								}), new Label({
									text: "{Quanstorage}"
								})]
							}),
							events: {
								dataReceived: function () {
									oDialog4.update();
								}
							}
						});
						oTable4.addColumn(new MColumn({
							header: new Label({
								text: "Storege"
							})
						}));
						oTable4.addColumn(new MColumn({
							header: new Label({
								text: "NameType"
							})
						}));
						oTable4.addColumn(new MColumn({
							header: new Label({
								text: "Quanstorage"
							})
						}));
					}
					oDialog4.update();
				}.bind(this));

				oDialog4.setTokens(this._oMultiInput4.getTokens());

				// set flag that the dialog is initialized
				this._bDialogInitialized4 = true;
				oDialog4.open();
			}.bind(this));
		},
		onFilterBarSearch4: function (oEvent) {
			var aFilters = [];
			var sQuery1 = oEvent.getParameter("selectionSet")[0].getProperty("value");
			var sQuery2 = oEvent.getParameter("selectionSet")[1].getProperty("value");
			var sQuery3 = oEvent.getParameter("selectionSet")[2].getProperty("value");
			if ((sQuery1 && sQuery1.length > 0) || (sQuery2 && sQuery2.length > 0) || (sQuery3 && sQuery3.length > 0)) {
				var filter = new Filter({
					filters: [
						new Filter({
							path: "Storege",
							operator: FilterOperator.Contains,
							value1: sQuery1
						}),
						new Filter({
							path: "NameType",
							operator: FilterOperator.Contains,
							value1: sQuery2
						}),
						new Filter({
							path: "Quanstorage",
							operator: FilterOperator.Contains,
							value1: sQuery3
						})
					],
					and: true
				});
				aFilters.push(filter);
			}

			// update list binding
			var oTable = this._oVHD4.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		onValueHelpOkPress4: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			// this._oMultiInput4.setValue(aTokens[0].mProperties.key);
			// this._onChangeId(aTokens[0].mProperties.key);
			var rowdata = window.temp.getView().getModel("sOrder1").getData();
			console.log(rowdata);
			rowdata.Sales.forEach(row => {
				console.log(row.Storage);
				if(row.Id == sh4row){
					row.Storage = aTokens[0].mProperties.key;
				}
			});
			// window.temp.getView().getModel("sOrder1").setData(rowdata);
			this._oVHD4.close();
		},

		onValueHelpCancelPress4: function () {
			this._oVHD4.close();
		}

	});
});