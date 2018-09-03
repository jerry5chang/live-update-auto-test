<template>
    <div>
        <div id="pageMask" class="mask" style="display: none"></div>

        <div id="addItemPage" class="mask" style="display: none">
            <div>
                <div>
                    <input class="textInput" id="importFwVersion" placeholder="Firmware File Name" type="text">
                </div>

                <div>
                    <input class="textInput" id="firmwareMD5" maxlength="32" placeholder="MD5" type="text">
                </div>
            
                <div>
                    <input id="isREQ" type="checkbox">REQ
                </div>

                <div class="debugMode">
                    <input type="file" id="uploadField" @change="filesChange($event.target.files);"
                    class="input-file">
                </div>
            
                <div class="updateBtnContainer">
                    <div id="updateBtn" @click="addItem()">Add</div>
                </div>
            </div>
        </div>

        <div class="btnContainer">
            <div style="height: 0px;">
                <select @change="changePath()" id="pathSelector"></select>
            </div>

            <div>
            </div>

            <div>
                <div class="button" id="addBtn" @click="showAddPage()"></div>
                <div class="button" id="saveBtn" @click="saveInfo()"></div>
                <div class="button" id="checkAllBtn" @click="checkAll()"></div>
            </div>
        </div>

        <table class="infoTable" cellspacing=0 border="1px">
            <tr class="headerBar">
                <td style="width:10%;" class="header">MODEL</td>
                <td style="width:5%;" class="header">REQFW</td>
                <td style="width:10%;" class="header">REQEXT</td>
                <td style="width:5%;" class="header">FW</td>
                <td style="width:10%;" class="header">EXT</td>
                <td style="width:5%;" class="header donotshow">URL</td>
                <td style="width:5%;" class="header donotshow">UT</td>
                <td style="width:5%;" class="header donotshow">BETAFW</td>
                <td style="width:10%;" class="header donotshow">BETAEXT</td>
                <!--td>Note</td-->
                <td style="width:10%;" class="header notInfo">MD5</td>
                <td style="width:15%;" class="header notInfo alignCenter">Status</td>
                <td style="width:5%;" class="header notInfo alignCenter donotshow debugMode">Update MD5</td>
                <td style="width:5%;" class="header notInfo alignCenter donotshow debugMode">Remove</td>
            </tr>
            
            <template v-for="item in versionInfo">
                <tr v-bind:id="item.MODEL">
                    <td name="MODEL">{{item.MODEL}}</td>
                    <td class="editable" name="REQFW"><div>{{item.REQFW}}</div></td>
                    <td class="editable" name="REQEXT"><div>{{item.REQEXT}}</div></td>
                    <td class="editable" name="FW"><div>{{item.FW}}</div></td>
                    <td class="editable" name="EXT"><div>{{item.EXT}}</div></td>
                    <td class="donotshow" name="URL">{{item.URL}}</td>
                    <td class="donotshow" name="UT">{{item.UT}}</td>
                    <td class="editable donotshow" name="BETAFW"><div>{{item.BETAFW}}</div></td>
                    <td class="editable donotshow" name="BETAEXT"><div>{{item.BETAEXT}}</div></td>
                    <!--td>{{item.Note}}</td-->
                    <td class="editable notInfo md5" name="MD5"><div>{{item.MD5}}</div></td>
                    <td class="notInfo checkStatus alignCenter" @click="checkFw($event)">{{item.STATUS}}</td>
                    <td class="notInfo alignCenter donotshow debugMode" @click="updateMD5($event)"><div class="removeBtn button"></div></td>
                    <td class="notInfo alignCenter donotshow debugMode" @click="remove($event)"><div class="removeBtn button">-</div></td>
                </tr>
            </template>
        </table>
    </div>
</template>

<script>
var debugMode = true;

const defPath = 'official'
var msgRef = firebase.database().ref(defPath);
const downloadPath = {
    "official": "Wireless/ASUSWRT/",
    "official_v30": "Wireless/ASUSWRT/",
    "sq": "LiveUpdate/Release/Wireless_SQ/",
    "mr": "LiveUpdate/Release/Wireless_SQ/" 
}

function updateVersion(importFwVersion) {
    if(importFwVersion == "") return false;

    var postData = {};
    var splitSharp = importFwVersion.split("#");
    var splitUnderline = importFwVersion.split("_");

    Array.prototype.insert = function ( index, item ) {
        this.splice( index, 0, item );
    }

    if(splitSharp.length > 1){
        if(splitSharp.length < 10){
            splitSharp.insert(1, "REQFW")
            splitSharp.insert(2, "REQEXT")
        }

        postData.MODEL = splitSharp[0].replace("+", "plus");
        postData.REQFW = splitSharp[1].replace("REQFW", "");
        postData.REQEXT = splitSharp[2].replace("REQEXT", "");
        postData.FW = splitSharp[3].replace("FW", "");
        postData.EXT = splitSharp[4].replace("EXT", "");
    }
    else{
        postData.MODEL = splitUnderline[0].replace("+", "plus");
        postData.FW = splitUnderline[1].replace(/\./g, '') + splitUnderline[2];
        postData.EXT = splitUnderline[3].split(".")[0];
    }

    if($("#isREQ").is(":checked")){
        postData.REQFW = postData.FW;
        postData.REQEXT = postData.EXT
    }

    postData.UT = "4208";
    postData.MD5 = ($("#firmwareMD5").val() === "") ? "NO_INFO" : $("#firmwareMD5").val();

    if(debugMode) console.log("[update->Query]", postData)
    msgRef.child(postData.MODEL).update(postData)
}

export default {
    name: 'ReleaseNote',

    data() {
        return {
            versionInfo: []
        }
    },

    methods: {
        saveInfo() {
            const _versionInfo = this.versionInfo;
            var infoHeader = [];
            var modelInfo = [];

            function download(text) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                element.setAttribute('download', "wlan_update_v2.zip");
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }

            for(var model in _versionInfo){
                var thisModel = _versionInfo[model];
                modelInfo.push(thisModel.MODEL);
    
                if(thisModel.REQFW){
                    modelInfo.push("REQFW" + thisModel.REQFW);
                    modelInfo.push("REQEXT" + thisModel.REQEXT);
                }

                modelInfo.push("FW" + thisModel.FW);
                modelInfo.push("EXT" + thisModel.EXT);
                modelInfo.push("URL");
                modelInfo.push("UT" + thisModel.UT);
                modelInfo.push("BETAFW");
                modelInfo.push("BETAEXT");
            }

            modelInfo.push("");
            download(modelInfo.join("#").replace(/BETAEXT#/g, "BETAEXT#\n\r"))
        },

        addItem(){
            updateVersion($("#importFwVersion").val());

            $("#importFwVersion").val("");
            $("#firmwareMD5").val("");
            $("#addItemPage").hide();
            $("#pageMask").hide();
        },

        checkFw(event) {
            var modelName = $(event.currentTarget).parent().attr("id");
            var target = this.versionInfo[modelName];
            var $this = $(event.currentTarget);
            var path = $("#pathSelector").val();

            var postData = {
                PATH: (downloadPath[path]) ? downloadPath[path] : "Wireless",
                MODEL: target.MODEL,
                FW: target.FW,
                EXT: target.EXT,
                MD5: target.MD5
            }

            if(debugMode){
                var fileType = {
                    "trx": "_un.zip", 
                    "rsa": "_rsa.zip",
                    "note": "_US_note.zip"
                };

                var downloadLink = "https://dlcdnets.asus.com/pub/ASUS/"
                downloadLink += postData.PATH;
                downloadLink += "/ASUSWRT/";
                downloadLink += postData.MODEL;
                downloadLink += "_";
                downloadLink += postData.FW.replace("004", "004_");
                downloadLink += "_";
                downloadLink += postData.EXT;
            
                console.log("[checkFw->Query]", postData);
                console.log("[checkFw->trxLink]", downloadLink+fileType.trx);
                console.log("[checkFw->rsaLink]", downloadLink+fileType.rsa);
                console.log("[checkFw->noteLink]", downloadLink+fileType.note);
            }

            $this
                .css({"background-color": "#FFF"})
                .html("<img src='/static/image/loading.gif'>");

            $.ajax({
                url: "http://localhost:3000/liveUpdateTest.cgi",
                data: postData,
                success: function(res){
                    if(debugMode) console.log("[checkFw->Result] " + postData.MODEL + ": " + res)

                    if(res.indexOf("No") !== -1){
                        $this.css({"background-color":"#FCC"})
                    }
                    else if(res.indexOf("MD5") !== -1){
                        $this.css({"background-color":"#FDF986"})
                    }
                    else{
                        $this.css({"background-color":"#FFF"})
                    }

                    $this.html(res);
                    msgRef.child(target.MODEL).update({"STATUS": res});
                }
            })
        },

        checkAll() {
            $(".checkStatus")
                .css({"background-color":"#FFF"})
                .each(function(i, item){$(item).click();})
        },

        remove() {
            if(confirm("Are you sure?")){
                var modelName = $(event.currentTarget).parent().attr("id");
                var target = this.versionInfo[modelName];
                msgRef.child(target.MODEL).remove();        
            }
        },

        updateMD5() {
            var modelName = $(event.currentTarget).parent().attr("id");
            var target = this.versionInfo[modelName];
            var path = $("#pathSelector").val();

            $.ajax({
                url: "http://localhost:3000/updateMD5.cgi",
                data: {
                    PATH: (downloadPath[path]) ? downloadPath[path] : "Wireless/ASUSWRT/",
                    MODEL: target.MODEL,
                    FW: target.FW,
                    EXT: target.EXT,
                },
                success: function(res){
                    if(debugMode) console.log("[updateMD5]", {"MD5": res});
                    msgRef.child(target.MODEL).update({"MD5": res});
                }
            })
        },

        changePath() {
            const vm = this;
            var path = $(event.currentTarget).val();

            msgRef = firebase.database().ref(path);
            msgRef.on('value', function(data) {
                vm.versionInfo = data.val();
            })
        },

        showAddPage(){
            $("#pageMask").show();
            $("#addItemPage").fadeIn(300);
        },

        filesChange(fieldName, fileList) {
            var fileToLoad = document.getElementById("uploadField").files[0];
            var fileReader = new FileReader();

            fileReader.onload = function(fileLoadedEvent){
                var textFromFileLoaded = fileLoadedEvent.target.result.replace(/\r/g, "#SPLIT").replace(/\n/g, "#SPLIT").split("#SPLIT");

                textFromFileLoaded.map(modelInfo => {
                    updateVersion(modelInfo)
                })
            };

            fileReader.readAsText(fileToLoad, "UTF-8");

            $("#importFwVersion").val("");
            $("#firmwareMD5").val("");
            $("#addItemPage").hide();
            $("#pageMask").hide();            
        }
    },

    mounted() {
        const vm = this;

        msgRef = firebase.database().ref(defPath);
        msgRef.on('value', function(data) {
            vm.versionInfo = data.val();
        })

        var rootRef = firebase.database().ref();
        rootRef.once('value', function(data) {
            $("#pathSelector").empty()

            for(var path in data.val()){
                $("#pathSelector")
                    .append($('<option />')
                        .text(path.toUpperCase())
                        .val(path)
                    )
            }

            $("#pathSelector").val(defPath)
         })
    },

    updated() {
        if(debugMode) $(".debugMode").show()

        $(".editable").click(function(){
            var $content = $($(this).find($("div"))[0]);

            if($(this).find($("input")).length != 0) return false;
            if(!$content) return false;

            var cachedVal = $content.html();
            var editInput = $('<input>');

            $content.hide();
            $(this).append(editInput);
            editInput
                .css({
                    "width": "95%",
                    "height": "20px",
                    "padding": "5px",
                    "border": "0px",
                    "border-bottom": "1px solid #CCC",
                    "font-family": "monospace"
                })
                .blur(function(){
                    var cachedVal = $(this).val();
                    var modelName = $(this).parent().parent().attr("id");
                    var header = $(this).parent().attr("name");
                    var postData = JSON.parse('{"' + header +  '":"' + cachedVal + '"}');

                    if(debugMode) console.log("[updateItem] " + modelName + ": ", postData)
                    msgRef.child(modelName).update(postData);

                    $("#pageMask").hide();
                    $($(this).parent().find("div")[0]).show();
                    $(this).remove();
                })
                .val(cachedVal)
                .focus()

            $("#pageMask").show()
        })

        $("#pageMask").click(function(){
            $("#pageMask").hide();
            $("#addItemPage").hide();
        })

        $(".checkStatus").each(function(i, item){
            var status = $(item).html()
            if($(item).html().indexOf("No") !== -1){
                $(item).css({"background-color":"#FCC"})
            }
            else if($(item).html().indexOf("MD5") !== -1){
                $(item).css({"background-color":"#FDF986"})
            }
            else{
                $(item).css({"background-color":"#FFF"})
            }
        })
    }
}
</script>

<style scoped>
    tr:hover{
/*
        background-color: #FC0 !important;
*/
    }
    #pageMask{
        width: 100%;
        height: 100%;
        position: fixed;
    }
    #addItemPage{
        background: #97a7b7;
        border-radius: 10px;
        width: 50%;
        height: 230px;
        top: 60px;
        left: 275px;
        position: absolute;
    }
    #addItemPage > div{
        text-align: left;
        padding: 30px;
    }
    #addItemPage > div > div{
        margin-top: 10px;
    }
    #isREQ{
        color:#FFF;
    }
    .updateBtnContainer{
        text-align: right;
        width: 100%;
    }
    #updateBtn{
        line-height: 50px;
        background-color: #05F;
        border-radius: 3px;
        color: #FFF;
        width: 100px;
        height: 50px;
        font-size: 20px;
        cursor: pointer;
        text-align: center;
        display: inline-block;
    }
    .infoTable{
        margin-top: 20px;
        text-align: left;
        font-family: monospace;
        width: 100%;
    }
    .infoTable td{
        padding: 10px;
        height: 35px;
    }
    .header{
        height: 20px !important;
        background: #DDD;
    }
    .btnContainer{
        width: 100%;
        text-align: center;
        margin-top: 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .button{
        font-family: monospace;
        display: inline-table;
        line-height: 50px;
        background-color: #05F;
        border-radius: 3px;
        color: #FFF;
        margin-left: 10px;
        border-radius: 50px;
        width: 50px;
        height: 50px;
        font-size: 36px;
        cursor: pointer;
        vertical-align: bottom;
    }
    .button:hover{
        background-color: #F00;
    }
    .removeBtn{
        font-weight: bold;
        width:20px;
        height:20px;        
        border-radius: 20px;
        color: #FFF;
        margin: auto;
        font-size: 20px;
        line-height: 16px;
    }
    #saveBtn{
        background: url(/static/image/download.png) no-repeat;
        background-size: cover;
    }
    #checkAllBtn{
        background: url(/static/image/check.png) no-repeat;
        background-size: cover;
    }
    #addBtn{
        background: url(/static/image/add.png) no-repeat;
        background-size: cover;
    }
    .textInput{
        width:95%;
        height:20px;
        padding:5px;
        border: 0px;
        border-bottom: 1px solid #CCC;
        font-family: monospace;
    }
    .donotshow{
      display: none;
    }
    .checkStatus{
        cursor: pointer;
        color: blue;
        text-decoration: underline;
        word-break: break-word;
    }
    .alignCenter{
        text-align: center;
    }
    .md5{
        word-break: break-all;
    }
    #pathSelector{
        width: 150px;
        height: 30px;
    }
</style>