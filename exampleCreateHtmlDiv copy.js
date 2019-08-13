var blankLabel = '';
var zoomp = 1;
var stateExpand = false;
var defaultTheme = "Classic";
var IgnorePnKey = "NO_CUST_CFG";
var loopNumber = 0;
var textCondition = "Use case : racking >> base_chassis_view >> rear_view >> front_view";
var trRearView;
var trBaseChassisView;

function DemoCreateHtmlDiv(){
    GetJson();
}

function GetJson(){
    var request = new XMLHttpRequest()

    request.open('GET', 'https://673f4e0a-aca3-40af-9ddc-83663362f553.mock.pstmn.io/jsonC2b', true)
    request.onload = function() {
        // Begin accessing JSON data here
        var data = JSON.parse(this.response)

        if (request.status >= 200 && request.status < 400) {
            console.log("Welcome to javascript function ^^");
            var startTime = new Date()
            console.log("Start time >> " + startTime.getHours() + ":" + startTime.getMinutes() + ":" + startTime.getSeconds())
            $('#startLabel').html("Start time >> " + startTime.getHours() + ":" + startTime.getMinutes() + ":" + startTime.getSeconds());

            $('#main-html').empty();
            var renderer = CreateHTMLDIV(data);
            //$('#main-html').append(renderer);

            var endTime = new Date()
            console.log("End time >> " + endTime.getHours() + ":" + endTime.getMinutes() + ":" + endTime.getSeconds())
            console.log("The duration time >> " + (endTime - startTime) / 1000 + "s")
            $('#endLabel').html("End time >> " + endTime.getHours() + ":" + endTime.getMinutes() + ":" + endTime.getSeconds());
            $('#durationTime').html("The duration time >> " + (endTime - startTime) / 1000 + "s");
            $('#allRow').html("Number of loops >> " + loopNumber + " round");
            $('#textCondition').html(textCondition);
        } else {
            console.log('error')
        }
    }

    request.send()
}

function CreateHTMLDIV(itg, isLabelLeft) {
    var di = $('<table />').addClass(itg.Type);
    di.attr('remark', 'slot-table-detail');
    di.attr('border', '1');
    $('#main-html').append(di);
    if (itg.Type == "side_by_side") {
        
        var tr = $('<tr />');
        for (p of itg.Position) {
            loopNumber++;
            var td = $('<td />');
            td.attr('remark', 'slot-info');
            td.click(p, ExpandDetail(p));
            var mat = p.Material;
            for (iitg of mat.Integate) {
                loopNumber++;
                td.append(DeviceContent(p, mat));
                td.append(CreateHTMLDIV(iitg));
            }
            tr.append(td);
        }
        di.append(tr);
    }
    else if (itg.Type == "racking") {
        
        var slotPrefix = itg.Type + "-slot-number";
        var maxSlot = parseInt(itg.Max_Slots);
        if (maxSlot != 0) {
            di.attr('max-slot', maxSlot);
            for (let i = maxSlot; i > 0; i--) {
                loopNumber++;
                di.append(CreateSlot(i - 1, isLabelLeft));
            }
            for (p of itg.Position) {
                loopNumber++;
                var mat = p.Material;
                var startSlot = parseInt(p.Start_Slot);
                var usedSlot = parseInt(p.Used_Slots);
                var slotNumber = (startSlot + usedSlot) - 1;
                var selectedSlot = di.find('[' + slotPrefix + '=' + slotNumber + ']');
                selectedSlot.attr('rowspan', usedSlot);
                for (let j = maxSlot; j > 0; j--) {
                    loopNumber++;
                    if (j < slotNumber && j >= startSlot) {
                        di.find('[' + slotPrefix + '=' + j + ']').remove();
                        var nextIntg = di.find('[' + slotPrefix + '=' + (j + 1) + ']').empty();
                        nextIntg.unbind().click(p, ExpandDetail(p));
                        nextIntg.append(DeviceContent(p, mat));
                        if (mat.Complex) {
                            nextIntg.addClass("HasComplex");
                        }
                        for (iitg of mat.Integate) {
                            loopNumber++;
                            nextIntg.append(CreateHTMLDIV(iitg));
                        }
                    }
                }
                if (usedSlot == 1) {
                    selectedSlot.empty().append(DeviceContent(p, mat));
                    selectedSlot.unbind().click(p, ExpandDetail(p));
                    for (iitg of mat.Integate) {
                        loopNumber++;
                        selectedSlot.append(CreateHTMLDIV(iitg));
                    }
                }

                if (isLabelLeft) {
                    var llbSlotProfix = slotPrefix + '-label'
                    var selectedSlotlabel = di.find('[' + llbSlotProfix + '=' + slotNumber + ']');
                    selectedSlotlabel.attr('rowspan', usedSlot);
                    for (let j = maxSlot; j > 0; j--) {
                        loopNumber++;
                        if (j < slotNumber && j >= startSlot) {
                            di.find('[' + llbSlotProfix + '=' + j + ']').remove();
                            var nextIntg = di.find('[' + llbSlotProfix + '=' + (j + 1) + ']').empty();
                            nextIntg.text(mat.Desc);
                        }
                    }
                    //todo : need to case  only one
                }
            }
        }
        else {
            var rack_index = 0;
            for (p of itg.Position) {
                loopNumber++;
                var mat = p.Material;
                di.append(CreateSlot(rack_index));
                var nextIntg = di.find('[' + slotPrefix + '=' + (rack_index) + ']').empty();
                rack_index++;
                nextIntg.unbind().click(p, ExpandDetail(p));
                nextIntg.append(DeviceContent(p, mat));
                if (mat.Complex) {
                    nextIntg.addClass("HasComplex");
                }
                for (iitg of mat.Integate) {
                    loopNumber++;
                    nextIntg.append(CreateHTMLDIV(iitg));
                }
            }
        }
    }
    else if (itg.Type == "XIOX") {
        
        var tr = $('<tr />');
        for (p of itg.Position) {
            loopNumber++;
            var td = $('<td />');
            td.attr('remark', 'slot-info');
            td.click(p, ExpandDetail(p));
            var mat = p.Material;
            if (mat.Complex) {
                console.log("Complex XIOX")
            }
            td.append(DeviceContent(p, mat));
            for (iitg of mat.Integate) {
                loopNumber++;
                td.append(CreateHTMLDIV(iitg));
            }
            tr.append(td);
        }
        di.append(tr);
    }
    else if (itg.Type == "io_cage") {
        
        var slotPrefix = itg.Type + "-slot-number";
        var yxSlot = itg.Max_Slots.split(',');
        var maxRow = yxSlot[0] - 1;
        for (let i = 0; i < parseInt(yxSlot[0]); i++) {
            loopNumber++;
            var tr = $('<tr />');
            for (let j = 0; j < parseInt(yxSlot[1]); j++) {
                loopNumber++;
                var td = $('<td />');
                td.attr(slotPrefix, i + "," + j);
                td.attr('remark', 'slot-info');
                td.click(ExpandDetail());
                var content = $('<div />');
                content.text(blankLabel);
                content.attr('remark', 'slot-content');
                td.append(content);
                tr.append(td);
            }
            di.append(tr);
        }
        RenderToSlot(itg, di, maxRow, slotPrefix);
    }
    else if (itg.Type == "front_view") {
        
        var slotPrefix = itg.Type + "-slot-number";
        var caption = $('<caption />');
        var content = $('<div />');
        content.text('Front View');
        content.attr('remark', 'slot-content');
        caption.append(content);
        di.append(caption);
        var yxSlot = itg.Max_Slots.split(',');
        var maxRow = yxSlot[0] - 1;
        for (let i = maxRow; i >= -1; i--) {
            loopNumber++;
            var tr = $('<tr />');
            var td = $('<td />').text((i == -1 ? "" : i));
            td.attr('remark', 'slot-label');
            tr.append(td);
            for (let j = 0; j < yxSlot[1]; j++) {
                loopNumber++;
                var tdl = $('<td />');
                tdl.attr('remark', 'slot-info');
                tdl.click(ExpandDetail());
                var content = $('<div />');
                content.attr('remark', 'slot-content');
                if (i >= 0) {
                    tdl.attr(slotPrefix, i + "," + j);
                    content.text(blankLabel);
                } else {
                    tdl.attr('remark', 'slot-label');
                    content.text(j);
                }

                tdl.append(content);
                tr.append(tdl);
            }
            di.append(tr);
        }

        RenderToSlot(itg, di, maxRow, slotPrefix);
    }
    else if (itg.Type == "blade_view" || itg.Type == "base_chassis_view") {
        
        var slotPrefix = itg.Type + "-slot-number";
        var yxSlot = itg.Max_Slots.split(',');
        var maxRow = yxSlot[0] - 1;
        for (let i = maxRow; i >= -1; i--) {
            loopNumber++;
            var tr = $('<tr />');
            var td = $('<td />').text((i == -1 ? "" : i));
            td.attr('remark', 'slot-label');
            tr.append(td);
            for (let j = 0; j < yxSlot[1]; j++) {
                loopNumber++;
                var tdl = $('<td />');
                tdl.attr('remark', 'slot-info');
                tdl.click(ExpandDetail());
                var content = $('<div />');
                content.attr('remark', 'slot-content');
                if (i >= 0) {
                    tdl.attr(slotPrefix, i + "," + j)
                    content.text(blankLabel);
                } else {
                    tdl.attr('remark', 'slot-label');
                    content.text(j);
                }
                tdl.append(content);
                tr.append(tdl);
            }
            di.append(tr);
        }
        RenderToSlot(itg, di, maxRow, slotPrefix);
    }
    else if (itg.Type == "rear_view") {
        
        var slotPrefix = itg.Type + "-slot-number";
        var caption = $('<caption />');
        var content = $('<div />');
        content.text('Rear View');
        content.attr('remark', 'slot-content');
        caption.append(content);
        di.append(caption);
        var yxSlot = itg.Max_Slots.split(',');
        var maxRow = yxSlot[0] - 1;
        for (let i = maxRow; i >= -1; i--) {
            loopNumber++;
            var tr = $('<tr />');
            var td = $('<td />').text((i == -1 ? "" : i));
            td.attr('remark', 'slot-label');
            tr.append(td);
            for (let j = 0; j < yxSlot[1]; j++) {
                loopNumber++;
                var tdl = $('<td />');
                tdl.attr('remark', 'slot-info');
                tdl.click(ExpandDetail());
                var content = $('<div />');
                content.attr('remark', 'slot-content');
                if (i >= 0) {
                    tdl.attr(slotPrefix, i + "," + j)
                    content.text(blankLabel);
                } else {
                    tdl.attr('remark', 'slot-label');
                    content.text(j);
                }
                tdl.append(content);
                tr.append(tdl);
            }
            di.append(tr);
        }
        RenderToSlot(itg, di, maxRow, slotPrefix);
    }
    else if (itg.Type == "rear_view_new") {

        var slotPrefix = itg.Type + "-slot-number";
        var caption = $('<caption />');
        var content = $('<div />');
        content.text('Rear View');
        content.attr('remark', 'slot-content');
        caption.append(content);
        di.append(caption);
        var yxSlot = itg.Max_Slots.split(',');
        var maxRow = yxSlot[0] - 1;
        for (let i = maxRow; i >= -1; i--) {
            loopNumber++;
            if (trRearView && i > -1) {
                var tdRearView = $('#' + slotPrefix + "-" + (i + 1));
                tdRearView.attr('id', slotPrefix + "-" + i);
                tdRearView.text((i == -1 ? "" : i));
                di.append(trRearView);
            }
            else {
                trRearView = $('<tr />');
                var td = $('<td />').text((i == -1 ? "" : i));
                td.attr('id', slotPrefix + "-" + i);
                td.attr('remark', 'slot-label');
                trRearView.append(td);
                for (let j = 0; j < yxSlot[1]; j++) {
                    loopNumber++;
                    var tdl = $('<td />');
                    tdl.attr('remark', 'slot-info');
                    tdl.click(ExpandDetail());
                    var content = $('<div />');
                    content.attr('remark', 'slot-content');
                    if (i == -1) {
                        tdl.attr('remark', 'slot-label');
                        content.text(j);
                    } else {
                        tdl.attr('id', slotPrefix + "-" + i);
                        tdl.attr(slotPrefix, i + "," + j)
                        content.text(blankLabel);
                    }
                    tdl.append(content);
                    trRearView.append(tdl);
                }
                di.append(trRearView);
            }
        }
        RenderToSlot(itg, di, maxRow, slotPrefix);
    }
    return di;
}

function ExpandDetail(data) {
    return function () {
        console.log("ExpandDetail")
        if (data.Material.WorkObject) {
            window.open('/SpManagement/C2B/C2BOperation?wo=' + data.Material.WorkObject, '_blank');
        }
        var fn_timestamp = new Date().getTime();
        if ((fn_timestamp - lastTimeSelect) > 50) {
            clearDetail();
            setTimeout(() => {
                var lastEle = $('#select-layer').children().last().children('a');
                if (lastEle.text() != blankLabel) {
                    $('#select-layer').children().last().children('a').click();
                } else {
                    console.log('select Blank');
                }
            }, 200);
        }
        var detail = data ? data.Slot_Label + "/" + data.Material.No : blankLabel;
        var li = $('<li />');
        var lia = $('<a />');
        lia.attr('href', '#');
        lia.text(detail);
        lia.click(() => {
            if (data) {
                li.attr('li-remark', data.Material.Id);
                BildingInfomation(data);
            } else {
                //console.log('Select Blank');
                clearInfomation();
            }
        });
        li.append(lia);
        $('#select-layer').prepend(li);
        lastTimeSelect = fn_timestamp;
    }
}

function BildingInfomation(data) {
    RemoveDeepLevel(data.Material.Id);
    var table = $('#select-info').empty();
    table.append('<tr><td>Slot Label</td><td>' + data.Slot_Label + '</td></tr>');
    table.append('<tr><td>Slot Type</td><td>' + data.Slot_Type + '</td></tr>');
    table.append('<tr><td>Start Slot</td><td>' + data.Start_Slot + '</td></tr>');
    table.append('<tr><td>Used Slots</td><td>' + data.Used_Slots + '</td></tr>');
    table.append('<tr><td>Work Object</td><td id="select-wo">' + data.Material.WorkObject + '</td></tr>');
    table.append('<tr><td>Desc</td><td>' + data.Material.Desc + '</td></tr>');
    table.append('<tr><td>No</td><td id="select-no">' + data.Material.No + '</td></tr>');
    var trans = '<tr><td>No(Translated)</td><td>';
    if (undefined !== data.MaterialTranslated && data.MaterialTranslated.length) {
        var labels = p.Slot_Label.split(':');
        for (let i = 0; i < p.MaterialTranslated.length; i++) {
            loopNumber++;
            trans += labels[i] + " : " + p.MaterialTranslated[i].No;
            if (i < p.MaterialTranslated.length) {
                trans += "<br/>";
            }
        }
    } else {
        trans += '-';
    }
    trans += '</td></tr>';
    table.append(trans);
    table.append('<tr><td>Movable</td><td>' + data.Material.Movable + '</td></tr>');
    table.append('<tr><td>Ref_Qty</td><td>' + data.Material.Ref_Qty + '</td></tr>');
    table.append('<tr><td>Instance_No</td><td>' + data.Material.Instance_No + '</td></tr>');
    table.append('<tr><td>Id</td><td>' + data.Material.Id + '</td></tr>');
    table.append('<tr><td>Diff_Flag</td><td>' + data.Material.Diff_Flag + '</td></tr>');
    table.append('<tr><td>Class</td><td>' + data.Material.Class + '</td></tr>');
    var view = $('#select-view').empty();
    var mat = data.Material;
    setTimeout(() => {
        if (undefined == mat.Integate || mat.Integate.length == 0) {
            $('#drilldown-action').addClass('hide');

        } else {
            $('#drilldown-action').removeClass('hide');
        }
    }, 100);
    for (iitg of mat.Integate) {
        loopNumber++;
        var contentdd = $('<div/>');
        var content = $('<div />');
        content.append(mat.Desc);
        if (mat.WorkObject) {
            content.append('<br/> Work Object : ' + mat.WorkObject);
        }
        content.attr('remark', 'slot-content');
        contentdd.append(content);
        contentdd.append(CreateHTMLDIV(iitg, true));
        view.append(contentdd);
        var abreak = $('<div class="page-break"></div>')
        view.append(abreak);
    }

    //vvvvvvvvvvvvvvvvvvvv item 163 vvvvvvvvvvvvvvvvvvvv
    //view.find('[remark=slot-table-detail]').addClass('hide'); 
    var childWos = view.find('[remark=slot-table-detail]');
    for (ch of childWos) {
        loopNumber++;
        var tch = $(ch).closest("td[remark='slot-info']");
        var htch = tch.find('div[w-obj]');
        if (htch.length > 0) {
            tch.find("table[remark='slot-table-detail']").addClass('hide');
        } else {
            var tchL = tch.children("div[remark='slot-content']");
            for (tchli of tchL) {
                loopNumber++;
                var nli = $(tchli).clone();
                view.append(nli);
                var vli = $(tchli).closest("td[remark='slot-info']").children("table[remark='slot-table-detail']");
                view.append(vli);
            }
        }
    }
    //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    view.children('[remark=slot-table-detail]').removeClass('hide');

    var clickable = view.find('[remark=slot-info]');
    for (c of clickable) {
        loopNumber++;
        var cc = $._data(c, 'events');
        var dataClick = cc.click[0].data;
        $(c).unbind().click(ExpandDetailView(dataClick));
    }

    if ($('#html-detail-panel').hasClass('hide')) {
        $('#html-detail-panel').removeClass('hide');
    }
    if ($('#html-dilldrow-detail').hasClass('hide')) {
        $('#html-dilldrow-detail').removeClass('hide');
    }
    if ($('#drilldown-action').hasClass('hide')) {
        $('#drilldown-action').removeClass('hide');
    }
    stateExpand = true;
    setCSSSelection();
}

function clearInfomation() {
    $('#select-info').empty();
    $('#select-view').empty();
}

function setCSSSelection() {
    var allContents = $('[remark=slot-content]');
    for (c of allContents) {
        loopNumber++;
        var text = $(c).text();
        if (text != blankLabel && text.length > 1) {
            var parent = $(c).parent();
            if (parent.is('td')) {
                parent.addClass('IsUsedSlot');
            }
        }
    }
}

function DeviceContent(p, mat, po) {
    var content = $('<div />');
    content.attr('remark', 'slot-content');
    content.attr('forpn', mat.Id + "-" + (po || 0));
    content.append(DeviceLabel(p, mat, po));
    if (mat.WorkObject) {
        content.attr('w-obj', mat.WorkObject);
        content.attr('SkipThisPart', mat.No == IgnorePnKey);
    }
    return content;
}

function CreateSlot(slotIndex, isLabelLeft) {
    var tr = $('<tr />');
    var td = $('<td />').text(slotIndex);
    td.attr('remark', 'slot-label');
    td.attr('rack-remark', 'slot-rack');
    tr.append(td);
    var rackSlot = $('<td />');
    var content = $('<div />');
    content.text(blankLabel);
    content.attr('remark', 'slot-content');
    rackSlot.append(content);
    rackSlot.attr('racking-slot-number', slotIndex);
    rackSlot.attr('remark', 'slot-info');
    rackSlot.click(ExpandDetail());
    tr.append(rackSlot);
    if (isLabelLeft) {
        var llb = $('<td />');
        llb.attr('racking-slot-number-label', slotIndex);
        tr.append(llb);
    }
    return tr;
}

function RenderToSlot(itg, di, maxRow, prefix) {
    for (p of itg.Position) {
        loopNumber++;
        if (p.Slot_Type == "coherent") {
            CreateCoherent(p, di, maxRow, prefix);
        }
        else if (p.Slot_Type == "discrete") {
            CreateDiscrete(p, di, prefix);
        }
    }
}

function clearDetail() {
    $('#select-layer').empty();
    clearInfomation();
}

function RemoveDeepLevel(liid) {
    var liList = $('#select-layer').children();
    var fRemoveNext = false;
    for (lis of liList) {
        loopNumber++;
        if (fRemoveNext) {
            $(lis).remove()
        }
        var li = $(lis).attr('li-remark');
        if (li == liid) {
            fRemoveNext = true;
        }
    }
}

function ExpandDetailView(data) {
    return function () {
        clearInfomation();
        var detail = data ? data.Slot_Label + "/" + data.Material.No : blankLabel;
        var li = $('<li />');
        var lia = $('<a />');
        lia.attr('href', '#');
        lia.text(detail);
        li.append(lia);
        lia.click(() => {
            if (data) {
                li.attr('li-remark', data.Material.Id);
                BildingInfomation(data);
            } else {
                //console.log('Select Blank');
                clearInfomation();
            }
        });
        if (data) {
            BildingInfomation(data);
        }
        $('#select-layer').append(li);
    }
}

function DeviceLabel(p, mat, po) {
    var lable = '';
    if (p.Slot_Label && !(undefined !== p.MaterialTranslated && p.MaterialTranslated.length && po)) {
        lable += p.Slot_Label + '<br/>';
    }
    if (mat.WorkObject) {
        lable += "WO : " + mat.WorkObject + " : ";
    }
    if (undefined !== p.MaterialTranslated && p.MaterialTranslated.length && po) {
        var labels = p.Slot_Label.split(':');
        lable += labels[po] + " : " + p.MaterialTranslated[po].No;
        //var labels = p.Slot_Label.split(':');
        //for (let i = 0; i < p.MaterialTranslated.length; i++) {
        //    lable += labels[i] + " : " + p.MaterialTranslated[i].No;
        //    if (i < p.MaterialTranslated.length) {
        //        lable += "<br/>";
        //    }
        //}
    } else {
        lable += mat.No;
    }
    return lable;
}

function CreateCoherent(p, di, parentMaxRow, prefix) {
    var mat = p.Material;
    var usedSlot = p.Used_Slots.split(':');
    if (usedSlot.length == 1) { //will render like discreate  
        CreateDiscrete(p, di, prefix);
    }
    else if (usedSlot.length == 2) {
        var startSlot = usedSlot[0].split(','), slotNumber = usedSlot[1].split(',');
        var SS0 = parseInt(startSlot[0]), SS1 = parseInt(startSlot[1]);
        var SN0 = parseInt(slotNumber[0]), SN1 = parseInt(slotNumber[1]);
        if (SN0 == SS0 && SN1 != SS1) { // horizontal
            var selectSlot = di.find('[' + prefix + '="' + usedSlot[0] + '"]');
            selectSlot.attr('colspan', SN1 - SS1 + 1);
            for (let j = SS1 + 1; j < SN1 + 1; j++) {
                loopNumber++;
                di.find('[' + prefix + '="' + SN0 + ',' + j + '"]').remove();
                var nextIntg = di.find('[' + prefix + '="' + usedSlot[0] + '"]').empty();
                nextIntg.append(DeviceContent(p, mat));
                nextIntg.unbind().click(p, ExpandDetail(p));
                for (iitg of mat.Integate) {
                    loopNumber++;
                    nextIntg.append(CreateHTMLDIV(iitg));
                }
            }
        } else if (SN0 != SS0 && SN1 == SS1) { // vertical
            var selectSlot = di.find('[' + prefix + '="' + usedSlot[1] + '"]');
            selectSlot.attr('rowspan', SN0 - SS0 + 1);
            for (let j = parentMaxRow; j >= -1; j--) {
                loopNumber++;
                if (j < SN0 && j >= SS0) {
                    di.find('[' + prefix + '="' + j + "," + SN1 + '"]').remove();
                    var nextIntg = di.find('[' + prefix + '="' + (j + 1) + "," + SN1 + '"]').empty();
                    nextIntg.append(DeviceContent(p, mat));
                    nextIntg.unbind().click(p, ExpandDetail(p));
                    for (iitg of mat.Integate) {
                        loopNumber++;
                        nextIntg.append(CreateHTMLDIV(iitg));
                    }
                }
            }
        } else if (SN0 != SS0 && SN1 != SS1) { //horizontal && vertical 
            var selectSlot = di.find('[' + prefix + '="' + SN0 + "," + SS1 + '"]');
            selectSlot.attr('rowspan', SN0 - SS0 + 1);
            selectSlot.attr('colspan', SN1 - SS1 + 1);
            for (let j = SS0; j <= SN0; j++) {
                loopNumber++;
                for (let k = SS1; k <= SN1; k++) {
                    loopNumber++;
                    if (j == SN0 && k == SS1) continue;
                    di.find('[' + prefix + '="' + j + "," + k + '"]').remove();
                    var nextIntg = selectSlot.empty();
                    nextIntg.append(DeviceContent(p, mat));
                    nextIntg.unbind().click(p, ExpandDetail(p));
                    for (iitg of mat.Integate) {
                        loopNumber++;
                        nextIntg.append(CreateHTMLDIV(iitg));
                    }
                }
            }
        }
    }
}

function CreateDiscrete(p, di, prefix) {
        var mat = p.Material;
        var usedSlot = p.Used_Slots.split(':');
        var slotLable = p.Slot_Label.split(':');
        for (po in usedSlot) {
            loopNumber++;
            var selectSlot = di.find('[' + prefix + '="' + usedSlot[po] + '"]').empty();
            selectSlot.append(DeviceContent(p, mat, po));
            selectSlot.unbind().click(p, ExpandDetail(p));
            for (iitg of mat.Integate) {
                loopNumber++;
                selectSlot.append(CreateHTMLDIV(iitg));
            }
        }
    }