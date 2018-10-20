import './_.jade';
import {
    OpenHumansDataList
} from "../../../../../imports/api/ga-models/constants";


function getGridDataFromOHList(data) {
    // each rowObject has to have row1,row2,row3 objects so that jade file can access them together, screw meteor+jade

    let gridData = [];
    let auxiliary = [];

    for (let i = 0; i < data.length; i++) {
        if (i % 3 === 0 && i > 0) {
            let rowObject = {
                row1: auxiliary[0],
                row2: auxiliary[1],
                row3: auxiliary[2]
            };

            gridData.push(rowObject);

            //clear aux array
            auxiliary = [];
        }
        auxiliary.push(data[i]);
    }

    if (auxiliary.length > 0) {
        // pushing leftover items, e.g. when last row has less than 3 items
        let rowObject = {
            row1: auxiliary[0],
            row2: auxiliary[1],
            row3: auxiliary[2]
        };

        gridData.push(rowObject);
    }

    return gridData;
}


Template.gaOpenHumansDataSourceModal.rendered = function() {
    markSelectedItems();
};

Template.gaOpenHumansDataSourceModal.onCreated(function() {
    this.gridData = getGridDataFromOHList(OpenHumansDataList);
});


Template.gaOpenHumansDataSourceModal.helpers({
    measureVariable: function() {
        let data = Template.instance().data;
        if (data && data.measureVariable) {
            return data.measureVariable.get();
        }
    },
    ohGridRows: function() {
        return Template.instance().gridData;
    }
});

Template.gaOpenHumansDataSourceModal.events({

    'click .oh-item': function(event) {
        let elem = $(event.currentTarget);
        elem.toggleClass('selected');
        elem.find('.selected-triangle').toggleClass('hide');
    },

    'click #openHumansSubmit': function(event, instance) {
        let selectedData = [0]; // IMPORTANT - index 0 is the default value, i.e. Gut instinct messaging
        let idSuffix = instance.data.idSuffix;

        $('#openhumans-data-modal-' + idSuffix).find('.oh-item.selected').not('.default').map((index, item) => {
            let id = $(item).attr('id').split('-')[3];
            selectedData.push(id);
        });

        let parentData = Template.instance().data;
        parentData.ohDataSourceVariable.set(selectedData);
    },

    'show .modal': function() {
        markSelectedItems();
    },

    'click #openHumansCancel': function(event, instance) {
        let selectedIds = Template.instance().data.ohDataSourceVariable.get();
        let idSuffix = instance.data.idSuffix;

        $('#openhumans-data-modal-' + idSuffix).find('.oh-item.selected').not('.default').map((index, item) => {
            let id = $(item).attr('id').split('-')[3];
            if (selectedIds.indexOf(id) === -1) {
                let elemId = '#oh-item-' + idSuffix + '-' + id;
                $(elemId).removeClass('selected');
                $(elemId).find('.selected-triangle').addClass('hide');
            }

        });
    }

});

function markSelectedItems() {
    let selectedIds = Template.instance().data.ohDataSourceVariable.get();
    let idSuffix = Template.instance().data.idSuffix;

    if (selectedIds && selectedIds.length > 0) {
        selectedIds.map((itemId) => {
            let elemId = '#oh-item-' + idSuffix + '-' + itemId;
            $(elemId).addClass('selected');
            $(elemId).find('.selected-triangle').removeClass('hide');
        });
    }
}