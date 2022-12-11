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
	"use strict";
	var oModel;
	var oMultiInput;
	var counter = 1;

	return Controller.extend("ztest_fiori_ks.controller.Table01", {
		onInit: function (oEvent) {

			this.mode = "Edit";
			var dataModel = this.getOwnerComponent().getModel("tableData");
			this.getView().setModel(dataModel, "sOrder1");
			this.temp = JSON.stringify(this.getView().getModel("sOrder1").getData());
			oMultiInput = this.byId("multiInput");
			this._oMultiInput = oMultiInput;

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

		},
		onAdd: function (oEvent) {
			this.mode = "Add";
			var that = this;

			that.getView().getModel("newModel").setProperty("/editable", true);

			var newRecord = {//create a dummy record to push when user click on Add
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
			var oTableData = oEvent.getSource().getModel("sOrder1").getData();//get table data
			oTableData.Sales.push(newRecord);//push this new record in model
			that.getView().getModel("sOrder1").setData(oTableData);//set data to the view
		},

		onChange: function (oEvent) {
			var that = this;
			var enteredText = oEvent.getParameters("value").value;
			this.recordexists = undefined;
			// var index=undefined;
			var sData = this.getView().getModel("sOrder1").getData().Sales;//get the model data
			var spath = parseInt(oEvent.getSource().getBindingContext("sOrder1").getPath().split("/")[2]);//get the index of enter data row

			var index = sData.findIndex(function (item, sindex) {//findIndex is a method used to validate if same value found it returns index position othervise it returns -1
				return item.Id === enteredText && sindex !== spath;
			});
			if (index > -1) {
				this.recordexists = index;
				that.getView().getModel("newModel").setProperty("/valueState", "Error");//set value state to error
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
			var selectedRowData = oTable.getSelectedContexts();//get the selected contexts 
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
					sData.Sales.splice(index, 1);//delete  record by using Splice
				}

				that.getView().getModel("sOrder1").setData(sData);//after deleting set the data
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

			oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZTEST_FIORI_KOSI_SRV/");
			var rawdata = window.temp.getView().getModel("sOrder1").getData().Sales;
			var data = {};
			var oCreateUrl = "/ztestStr001Set";
			var boolreact = true;
			var isEmpty = false;

			console.log();

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
			}
			else if (order == -1) {
				return true;
			}

			if (isEmpty) {
				MessageToast.show("Заполните все поля в таблице");
			}
			else {
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
						function (response) {
						},
						function (error) {
							boolreact = false;
						}
					);
				});
			}
			return boolreact;
		},

		// SH для названия товара

		onValueHelpRequested: function () {
			this._oBasicSearchField = new SearchField();
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					id: this.getView().getId(),
					name: "ztest_fiori_ks.view.VHName",
					controller: this
				});
			}
			this.pDialog.then(function (oDialog) {
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
					label: "Name",
					key: "Name",
					type: "string",
					typeInstance: new TypeString({}, {
						maxLength: 3
					})
				}]);

				// Set Basic Search for FilterBar
				oFilterBar.setFilterBarExpanded(false);
				oFilterBar.setBasicSearch(this._oBasicSearchField);

				// Trigger filter bar search when the basic search is fired
				this._oBasicSearchField.attachSearch(function () {
					oFilterBar.search();
				});

				oDialog.getTableAsync().then(function (oTable) {

					oTable.setModel(this.oProductsModel);

					// For Desktop and tabled the default table is sap.ui.table.Table
					if (oTable.bindRows) {
						// Bind rows to the ODataModel and add columns
						oTable.bindAggregation("rows", {
							path: "/ZtestposSet",
							events: {
								dataReceived: function () {
									oDialog.update();
								}
							}
						});
						oTable.addColumn(new UIColumn({
							label: "Name",
							template: "Name"
						}));
						oTable.addColumn(new UIColumn({
							label: "NameType",
							template: "NameType"
						}));
						oTable.addColumn(new UIColumn({
							label: "Price",
							template: "Price"
						}));
					}

					// For Mobile the default table is sap.m.Table
					if (oTable.bindItems) {
						// Bind items to the ODataModel and add columns
						oTable.bindAggregation("items", {
							path: "/ZtestposSet",
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
									oDialog.update();
								}
							}
						});
						oTable.addColumn(new MColumn({
							header: new Label({
								text: "Name"
							})
						}));
						oTable.addColumn(new MColumn({
							header: new Label({
								text: "NameType"
							})
						}));
						oTable.addColumn(new MColumn({
							header: new Label({
								text: "Price"
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
		onFilterBarSearch: function (oEvent) {
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
			var oTable = this._oVHD.getTable();
			var oBinding = oTable.getBinding("rows");
			oBinding.filter(aFilters, "Application");
		},

		onValueHelpOkPress: function (oEvent) {
			var aTokens = oEvent.getParameter("tokens");
			// this._oMultiInput.setTokens(aTokens);
			this._oMultiInput.setValue(aTokens[0].mProperties.key);
			this._oVHD.close();
		},

		onValueHelpCancelPress: function () {
			this._oVHD.close();
		},

		onOpenDialog: function () {
			// load BusyDialog fragment asynchronously
			var oDialog = this.byId("BusyDialog");
			oDialog.open();

			setTimeout(function () {
				oDialog.close();
			}, 1000);
		}

	});
});