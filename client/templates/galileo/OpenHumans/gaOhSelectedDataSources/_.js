import './_.jade';
import {
    OpenHumansDataList
} from "../../../../../imports/api/ga-models/constants";


Template.gaOhSelectedDataSources.onCreated(function() {});

Template.gaOhSelectedDataSources.helpers({
    ohDataSources: function() {
        let ids = Template.instance().data.ohDataSourceIdsVar.get();
        return getSelectedOhItemsIds(ids);
    },
    hasDataSources: function() {
        let ids = Template.instance().data.ohDataSourceIdsVar.get();
        return getSelectedOhItemsIds(ids) !== null;
    },
});

Template.gaOhSelectedDataSources.events({

});

function getSelectedOhItemsIds(ids) {
    let isViewOnly = Template.instance().data.viewOnly;
    if (ids && ids.length > 0) {
        let sourceArr = [];
        ids.forEach((itemId) => {
            if (itemId >= 0 && itemId < OpenHumansDataList.length) {
                let item = OpenHumansDataList[itemId];
                if (isViewOnly && item.default) {
                    return;
                }
                sourceArr.push(item);
            }
        });
        return sourceArr;
    }
    return null;
}